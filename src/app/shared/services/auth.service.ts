import { Injectable, inject, signal } from '@angular/core';
import {
  ActionCodeSettings,
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  verifyPasswordResetCode,
  confirmPasswordReset,
  GoogleAuthProvider,
  signInWithRedirect,
  getAuth,
  setPersistence,
  browserSessionPersistence,
  authState,
  getRedirectResult,
  signInAnonymously,
} from '@angular/fire/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { UserInterface } from '../interfaces/user.interface';
import { Router } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { User } from '../../../models/user.class';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  user: User = new User();

  provider = new GoogleAuthProvider();
  activeUserAccount: any = null;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private firebase: FirebaseService) {
    this.resultGoogleAuth();

    authState(this.firebaseAuth).subscribe((user) => {
      if (user) {
        // Hier könntest du zusätzliche Daten laden und im currentUserSubject speichern
        this.currentUserSubject.next(this.user);
      } else {
        this.currentUserSubject.next(null);
      }
    });

    this.firebaseAuth.onAuthStateChanged(
      (user) => (this.activeUserAccount = user)
    );
  }

  googleAuth() {
    const auth = getAuth();
    signInWithRedirect(auth, this.provider);
  }

  resultGoogleAuth() {
    const auth = getAuth();
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const user = result.user;
          this.user.id = user.uid ?? this.user.id;
          this.user.avatar = user.photoURL ?? this.user.avatar;
          this.user.email = user.email ?? this.user.email;
          this.user.displayName = user.displayName ?? this.user.displayName;
          this.user.provider = 'google';
          this.firebase.updateUser(this.user, this.user.id);
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
    // setPersistence(auth, browserSessionPersistence)
    // .then(() => {
    //   return signInWithRedirect(auth, this.provider);
    // })
    // .catch((error) => {
    //   const errorCode = error.code;
    //   const errorMessage = error.message;
    // });
    // this.showInformations();
  }

  register(
    email: string,
    username: string,
    password: string,
    photoURL: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((response) => {
      updateProfile(response.user, {
        displayName: username,
        photoURL: photoURL,
      });
      const currentUser = this.firebaseAuth.currentUser;

      if (currentUser) {
        this.user.id = currentUser.uid ?? this.user.id;
        this.user.avatar = photoURL ?? this.user.avatar;
        this.user.email = currentUser.email ?? this.user.email;
        this.user.displayName = username ?? this.user.displayName;
        this.user.provider = 'email';
        this.firebase.updateUser(this.user, this.user.id);
      }
    });
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {
      const currentUser = this.firebaseAuth.currentUser;
      if (currentUser) {
        this.user.id = currentUser.uid ?? this.user.id;
        if (currentUser.photoURL) {
          this.user.avatar = currentUser.photoURL;
        }
        this.user.email = currentUser.email ?? this.user.email;
        this.user.displayName =
          currentUser.displayName ?? this.user.displayName;
        this.user.isOnline = true;
        this.user.provider = 'email';
        this.firebase.updateUser(this.user, this.user.id);
      }
    });

    // setPersistence(auth, browserSessionPersistence)
    //   .then(() => {
    //     // Existing and future Auth states are now persisted in the current
    //     // session only. Closing the window would clear any existing state even
    //     // if a user forgets to sign out.
    //     // ...
    //     // New sign-in will be persisted with session persistence.
    //     return signInWithEmailAndPassword(auth, email, password);
    //   })
    //   .catch((error) => {
    //     // Handle Errors here.
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //   });

    return from(promise);
  }

  logout(): Promise<void> {
    const currentUser = this.firebaseAuth.currentUser;
    if (currentUser) {
      this.user.id = currentUser.uid ?? this.user.id;
      this.user.isOnline = false;
      this.firebase.updateUser(this.user, this.user.id);
    }
    
    return new Promise<void>((resolve, reject) => {
      signOut(this.firebaseAuth).then(() => {
        this.router.navigate(['/login']);
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  }

  sendMailToResetPassword(
    email: string,
    actionCodeSettings?: ActionCodeSettings | undefined
  ): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email).then(
      () => {}
    );
    return from(promise);
  }

  resetPassword(actionCode: string, newPassword: string) {
    const auth = getAuth();
    verifyPasswordResetCode(auth, actionCode)
      .then(() => {
        confirmPasswordReset(auth, actionCode, newPassword)
          .then((resp) => {
            this.router.navigate(['/login']);
          })
          .catch((error) => {
            console.log('error during confirmation');
            return error;
          });
      })
      .catch((error) => {
        console.log('invalid code or email');
        return error;
      });
  }

  signInAnonymous() {
    const randomInt = Math.floor(Math.random() * 6) + 1;
    const auth = getAuth();
    signInAnonymously(auth)
      .then(async (response) => {
        await updateProfile(response.user, {
          displayName: 'Anonym',
          photoURL: 'http://localhost:4200/assets/img/characters/template' + randomInt + '.svg',
        });
        const currentUser = this.firebaseAuth.currentUser;
        if (currentUser) {
          this.user.id = currentUser.uid ?? this.user.id;
          this.user.avatar = response.user.photoURL ?? this.user.avatar;
          this.user.email = '';
          this.user.displayName = response.user.displayName ?? this.user.displayName;
          this.user.provider = 'anonym';
          this.user.isOnline = true;
          return this.firebase.updateUser(this.user, this.user.id);
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  get activeUserId(): string {
    return this.activeUserAccount ? this.activeUserAccount.uid : null;
  }
}
