import { inject, Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from '@angular/fire/auth';
import { Firestore, collection, CollectionReference, doc, getDoc, setDoc, updateDoc, docData, DocumentReference, query, where, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, of, concatMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private auth;
  private db;

  private userCollection: CollectionReference;
  private errorMessages = new Map<string, string>([
    ["auth/user-not-found", "Invalid email."],
    ["auth/wrong-password", "Incorrect password."],
    ["auth/missing-password", "Incorrect password."],
    ["auth/invalid-email", "Invalid email."],
    ["auth/email-already-in-use", "This email is already in use."],
    ["auth/weak-password", "Weak password. Use at least 6 characters."],
    ["auth/passwords-do-not-match", "Passwords do not match."],
    ["auth/cancelled-popup-request", "The popup request was canceled."],
    ["auth/network-request-failed", "Network error."],
  ]);

  private userStateSubject = new BehaviorSubject<{ logged: boolean; nameInitial: string }>({
    logged: false,
    nameInitial: 'A'
  });
  
  constructor() {
    this.auth = inject(Auth);
    this.db = inject(Firestore);

    this.userCollection = collection(this.db, 'Users');

    authState(this.auth).subscribe(user => {
        const logged = !!user;
        const nameInitial = user?.displayName ? user.displayName[0].toUpperCase() : 'A';
        this.userStateSubject.next({ logged, nameInitial });
    });
  }

  async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      if (!this.isValidEmail(email)) throw { code: "auth/invalid-email" };
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async registerWithEmailAndPassword(email: string, password: string, repeatPassword: string): Promise<void> {
    try {
      if (!this.isValidEmail(email)) throw { code: "auth/invalid-email" };
      if (password.length < 6) throw { code: "auth/weak-password" };
      if (password !== repeatPassword) throw { code: "auth/passwords-do-not-match" };
      await createUserWithEmailAndPassword(this.auth, email, password);
      await this.checkUser();
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(this.auth, new GoogleAuthProvider());
      await this.checkUser();
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async recoverPassword(email: string): Promise<void> {
    try {
      if (!this.isValidEmail(email)) throw { code: "auth/invalid-email" };
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  private async checkUser(): Promise<void> {
    if (!this.auth.currentUser) return;

    const userDocRef = doc(this.userCollection, this.auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        _id: this.auth.currentUser.uid,
        email: this.auth.currentUser.email,
        name: this.auth.currentUser.displayName || "",
      });
    }
  }

  private handleAuthError(error: any): string {
    if (error.code === "auth/popup-closed-by-user") return '';
    return this.errorMessages.get(error.code) || "An error occurred. Please try again.";
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getUserState(): Observable<{ logged: boolean; nameInitial: string }> {
    return this.userStateSubject.asObservable();
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async updateUserName(newName: string): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(this.userCollection, user.uid);
        await updateDoc(userDocRef, { name: newName });
        await updateProfile(user, { displayName: newName });
        this.userStateSubject.next({ logged: true, nameInitial: newName[0].toUpperCase() });
      } catch (error) {
        console.error('Error updating name:', error);
        throw error;
      }
    }
  }

  getNameAndEmail(): Observable<{ email: string; name: string } | null> {
    return authState(this.auth).pipe(
      concatMap(user => {
        if (user) {
          const userDocRef: DocumentReference = doc(this.userCollection, user.uid);
          return docData(userDocRef) as Observable<{ email: string; name: string }>;
        }
        return of(null);
      })
    );
  }

  isCurrentUser(userId: string): boolean {
    return this.auth.currentUser?.uid == userId;
  }

  getUidWithEmail(email: string): Observable<{uid: string, name: string}> {
    return new Observable<{uid: string, name: string}>((observer) => {
      if (!this.isValidEmail(email)) { 
        observer.error(new Error('Invalid email.'));
        return;
      }
      const userQuery = query(this.userCollection, where('email', '==', email));
      from(getDocs(userQuery)).pipe(take(1)).subscribe({
        next: snapshot => {
          if (snapshot.empty) {
            observer.error(new Error('No user found with this email.'));
          } else {
            const userData = snapshot.docs[0].data();
            observer.next({ uid: userData['_id'], name: userData['name'] });
            observer.complete();
          }
        },
        error: err => {
          observer.error(err);
        }
      });
    });
  }
}
