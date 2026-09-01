import { inject, Injectable } from "@angular/core";
import { collection, CollectionReference, doc, docData, DocumentReference, Firestore } from "@angular/fire/firestore";
import { first, map, Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private db;

  private permissionCollection: CollectionReference;

  constructor() {
    this.db = inject(Firestore)
    this.permissionCollection = collection(this.db, 'Permissions');
  }

  organizationHasPermission(orgId: string, appId: string): Observable<boolean> {
    const permissionsDocReference: DocumentReference = doc(this.permissionCollection, orgId);
    return docData(permissionsDocReference).pipe(
      first(),
      map(document => document?.[appId] as boolean)
    );
  }
}