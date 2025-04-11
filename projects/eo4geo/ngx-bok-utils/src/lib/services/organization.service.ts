import { inject, Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, CollectionReference, doc, updateDoc, docData, DocumentReference, collectionData, setDoc, deleteDoc } from '@angular/fire/firestore';
import { ToastMessageOptions } from 'primeng/api';
import { catchError, concatMap, first, forkJoin, from, map, Observable, of, Subject, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private auth;
  private db;

  private userCollection: CollectionReference;
  private orgCollection: CollectionReference;

  private adminOrganizationMessagesSource = new Subject<ToastMessageOptions>();
  adminOrganizationMessages$ = this.adminOrganizationMessagesSource.asObservable();
  
  constructor() {
    this.auth = inject(Auth);
    this.db = inject(Firestore)
    this.userCollection = collection(this.db, 'Users');
    this.orgCollection = collection(this.db, 'Organizations');
  }

  emitMessage(message: ToastMessageOptions) {
    this.adminOrganizationMessagesSource.next(message)
  }

  getOrganizations(): Observable<{ _id: string, name: string }[]> {
    return collectionData(this.orgCollection) as Observable<{ _id: string, name: string }[]>;
  }

  getUserOrganizations(): Observable<{ _id: string, name: string; description: string, email: string, isAdmin: boolean }[]> {
    return authState(this.auth).pipe(
      concatMap(user => {
        if (user) {
          const userDocRef: DocumentReference = doc(this.userCollection, user.uid);
          return docData(userDocRef) as Observable<{ organizations: string[] }>;
        }
        return of(null);
      }),
      concatMap(userData => {
        if (userData?.organizations && userData.organizations.length > 0) {
          const orgRequests = userData.organizations.map(orgId => this.getOrganizationInfo(orgId));
          return forkJoin(orgRequests);
        }
        return of([]);
      })    
    );
  }

  private getOrganizationInfo(orgId: string): Observable<{ _id: string, name: string; description: string, email:string, isAdmin: boolean }> {
    const orgDocRef: DocumentReference = doc(this.orgCollection, orgId);
    return docData(orgDocRef).pipe(
      first(),
      map(document => ({
        _id: document?.['_id'],
        name: document?.['name'],
        description: document?.['description'],
        email: document?.['contact'],
        isAdmin: Array.isArray(document?.['admin']) && document['admin'].includes(this.auth.currentUser?.uid)
      }))
    );
  }

  getOrganizationUsers(orgId: string): Observable<{ _id: string, name: string; email: string, isAdmin: boolean }[]> {
    const orgDocRef = doc(this.orgCollection, orgId);
    const organizationUsersSnapshot = docData(orgDocRef) as Observable<{ admin: string[], regular: string[] }>;
    return organizationUsersSnapshot.pipe(
      concatMap(users => {
          const adminUsers$ = users.admin.map(uid =>
              this.getUserInfo(uid).pipe(take(1),map(user => ({ ...user, isAdmin: true })))
          );

          const regularUsers$ = users.regular.map(uid =>
              this.getUserInfo(uid).pipe(take(1), map(user => ({ ...user, isAdmin: false })))
          );

          return forkJoin([...adminUsers$, ...regularUsers$]);
      })
    );
  }

  private getUserInfo(uid: string): Observable<{ _id: string, name: string; email: string }> {
    const orgDocRef: DocumentReference = doc(this.userCollection, uid);
    return docData(orgDocRef) as Observable<{ _id: string, name: string; email: string }>;
  }

  getOrganizationDivisions(orgId: string): Observable<string[]> {
    const orgDocRef = doc(this.orgCollection, orgId);
    const organizationUsersSnapshot = docData(orgDocRef) as Observable<{ divisions: string[] }>;
    return organizationUsersSnapshot.pipe(
      map(data => data.divisions)
    );
  }
  
  leaveOrganization(orgId: string): Observable<void> {
    return this.updateOrganizationUsers(orgId, this.removeItem).pipe(
      concatMap(() => this.updateUserOrganizations(orgId, this.removeItem)));
  }
  
  joinOrganization(orgId: string): Observable<void> {
    return this.updateOrganizationUsers(orgId, this.addItem, undefined, this.nothing).pipe(
      concatMap(() => this.updateUserOrganizations(orgId, this.addItem)));
  }

  deleteUserFromOrganization(orgId: string, userId: string) {
    return this.updateOrganizationUsers(orgId, this.removeItem, userId).pipe(
      concatMap(() => this.updateUserOrganizations(orgId, this.removeItem, userId)));
  }

  addUserToOrganization(orgId: string, userId: string) {
    return this.updateOrganizationUsers(orgId, this.addItem, userId, this.nothing).pipe(
      concatMap(() => this.updateUserOrganizations(orgId, this.addItem, userId)));
  }

  changeAdminState(orgId: string, userId: string, newState: boolean) {
    return newState 
      ? this.updateOrganizationUsers(orgId, this.removeItem, userId, this.addItem) 
      : this.updateOrganizationUsers(orgId, this.addItem, userId, this.removeItem);
  }
  
  private updateUserOrganizations(orgId: string, updateFn: (arr: string[], item: string) => string[], userId?: string): Observable<void> {
    const currentUserId = userId ?? this.auth.currentUser?.uid;
    if (!currentUserId) return of(void 0);
    const userDocRef = doc(this.userCollection, currentUserId);
    const userOrganizationsSnapshot = docData(userDocRef) as Observable<{ organizations: string[] }>;
    return new Observable<void>((observer) => {
      userOrganizationsSnapshot.pipe(take(1)).subscribe(async (userOrganizations) => {
        if (!userOrganizations) {
          observer.error(new Error('User organizations data is unavailable.'));
          return;
        }
        const updatedOrganizations = updateFn(userOrganizations.organizations ?? [], orgId);
        await updateDoc(userDocRef, { organizations: updatedOrganizations });
        observer.next();
        observer.complete();
      });
    });
  }
  
  private updateOrganizationUsers(orgId: string, updateFn: (arr: string[], item: string) => string[], userId?: string, updateAdminFn?: (arr: string[], item: string) => string[]): Observable<void> {
    const orgDocRef = doc(this.orgCollection, orgId);
    const organizationUsersSnapshot = docData(orgDocRef) as Observable<{ admin: string[], regular: string[] }>;
    return new Observable<void>((observer) => {
      organizationUsersSnapshot.pipe(take(1)).subscribe(async (organizationUsers) => {
        if (!organizationUsers) {
          observer.error(new Error('Organization users data is unavailable.'));
          return;
        }
        const currentUserId = userId ?? this.auth.currentUser?.uid;
        if (!currentUserId) {
          observer.error(new Error('Current user is not authenticated.'));
          return;
        }
        if (organizationUsers.admin.length == 1 && organizationUsers.admin.includes(currentUserId)) {
          observer.error(new Error('Cannot perform action: Current user is the only administrator.'));
          return;
        }
        await updateDoc(orgDocRef, {
          admin: updateAdminFn ? updateAdminFn(organizationUsers.admin, currentUserId) : updateFn(organizationUsers.admin, currentUserId),
          regular: updateFn(organizationUsers.regular, currentUserId)
        });
        observer.next();
        observer.complete();
      });
    });
  }

  addDivisions(orgId: string, newDivision: string): Observable<void> {
    return this.updateOrganizationDivisions(orgId, newDivision, this.addItem);
  }
  
  deleteDivision(orgId: string, newDivision: string): Observable<void> {
    return this.updateOrganizationDivisions(orgId, newDivision,  this.removeItem);
  }

  private updateOrganizationDivisions(orgId: string, newDivision: string, updateFn: (arr: string[], item: string) => string[]): Observable<void> {
    const orgDocRef = doc(this.orgCollection, orgId);
    const organizationDivisions = this.getOrganizationDivisions(orgId);
    return new Observable<void>((observer) => {
      organizationDivisions.pipe(take(1)).subscribe(async (divisions) => {
        if (!divisions) {
          observer.error(new Error('Organization divisions data is unavailable.'));
          return;
        }
        await updateDoc(orgDocRef, {
          divisions: updateFn(divisions, newDivision)
        });
        observer.next();
        observer.complete();
      });
    });
  }
  
  private addItem(arr: string[], item: string): string[] {
    return [...arr, item];
  }
  
  private removeItem(arr: string[], item: string, ): string[] {
    return arr.filter(i => i !== item);
  }

  private nothing(arr: string[], item: string, ): string[] {
    return arr;
  }

  updateOrganizationInformation(orgId: string, info: { name: string | null; description: string | null; contact: string | null }): Observable<void> {
    const orgDocRef = doc(this.orgCollection, orgId);
    return new Observable<void>((observer) => {
      const updateData: Record<string, string> = {};
      Object.entries(info).forEach(([key, value]) => {
        if (value !== null) {
          updateData[key] = value;
        }
      });
      if (Object.keys(updateData).length > 0) {
        updateDoc(orgDocRef, updateData)
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch((error) => observer.error(error));
      } else {
        observer.complete();
      }
    });
  }

  createOrganization(name: string, description: string, contact: string) {
    const currentUserId = this.auth.currentUser?.uid;
    if (!currentUserId) {
      throw new Error('Current user is not authenticated.');
    }
    const orgRef = doc(this.orgCollection);
    const org = {
      _id: orgRef.id,
      name,
      description,
      admin: [currentUserId],
      regular: [],
      pending: [],
      adminUser: [],
      regularUser: [],
      pendingUser: [],
      isPublic: false,
      contact,
      divisions: [],
    };
    return from(setDoc(orgRef, org)).pipe(
      concatMap(() => this.updateUserOrganizations(org._id, this.addItem, currentUserId)),
      take(1)
    );
  }

  deleteOrganization(orgId: string, users: string[]): Observable<void> {
    const userObservables = users.map(uid => this.updateUserOrganizations(orgId, this.removeItem, uid));
    return forkJoin(userObservables).pipe(
      concatMap(() => {
        const orgRef = doc(this.orgCollection, orgId);
        return from(deleteDoc(orgRef)).pipe(
          catchError((error) => {
            throw new Error('Error al eliminar la organización');
          }),
          take(1)
        );
      })
    );
  }
}
