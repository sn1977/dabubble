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
  signInWithPopup,
  signInWithRedirect,
  getAuth,
  OAuthCredential,
  authState,
} from '@angular/fire/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { UserInterface } from '../interfaces/user.interface';
import { Router } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { User } from '../../../models/user.class';
import { getRedirectResult } from '@firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  user: User = new User();
  provider = new GoogleAuthProvider();

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
          this.user.name = user.displayName ?? this.user.name;
          this.user.provider = 'google';
          this.firebase.updateUser(this.user, this.user.id);
          this.router.navigateByUrl('/');
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
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
      updateProfile(response.user, { displayName: username });
      const currentUser = this.firebaseAuth.currentUser;
      if (currentUser) {
        this.user.id = currentUser.uid ?? this.user.id;
        this.user.avatar = photoURL ?? this.user.avatar;
        this.user.email = currentUser.email ?? this.user.email;
        this.user.name = username ?? this.user.name;
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
        this.user.avatar = currentUser.photoURL ?? this.user.avatar;
        this.user.email = currentUser.email ?? this.user.email;
        this.user.name = currentUser.displayName ?? this.user.name;
        this.user.isOnline = true;
        this.user.provider = 'email';
        this.firebase.updateUser(this.user, this.user.id);
      }
    });
    return from(promise);
  }

  logout(): Observable<void> {
    const currentUser = this.firebaseAuth.currentUser;
    if (currentUser) {
      this.user.id = currentUser.uid ?? this.user.id;
      this.user.avatar = currentUser.photoURL ?? this.user.avatar;
      this.user.email = currentUser.email ?? this.user.email;
      this.user.name = currentUser.displayName ?? this.user.name;
      this.user.isOnline = false;
      this.firebase.updateUser(this.user, this.user.id);
    }
    const promise = signOut(this.firebaseAuth);
    this.router.navigate(['/login']);
    return from(promise);
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

  resetPassword(oobCode: string, password: string) {
    console.log('password reset: ', oobCode, password);

    //     import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

    // function handleResetPassword(auth, actionCode, continueUrl, lang) {
    //   // Localize the UI to the selected language as determined by the lang
    //   // parameter.

    //   // Verify the password reset code is valid.
    //   verifyPasswordResetCode(auth, actionCode).then((email) => {
    //     const accountEmail = email;

    //     // TODO: Show the reset screen with the user's email and ask the user for
    //     // the new password.
    //     const newPassword = "...";

    //     // Save the new password.
    //     confirmPasswordReset(auth, actionCode, newPassword).then((resp) => {
    //       // Password reset has been confirmed and new password updated.

    //       // TODO: Display a link back to the app, or sign-in the user directly
    //       // if the page belongs to the same domain as the app:
    //       // auth.signInWithEmailAndPassword(accountEmail, newPassword);

    //       // TODO: If a continue URL is available, display a button which on
    //       // click redirects the user back to the app via continueUrl with
    //       // additional state determined from that URL's parameters.
    //     }).catch((error) => {
    //       // Error occurred during confirmation. The code might have expired or the
    //       // password is too weak.
    //     });
    //   }).catch((error) => {
    //     // Invalid or expired action code. Ask user to try to reset the password
    //     // again.
    //   });
    // }
  }

  whoAmI(): Observable<void> {
    const currentUser = this.firebaseAuth.currentUser;
    if (currentUser) {
      this.user.id = currentUser.uid ?? this.user.id;
      this.user.avatar = currentUser.photoURL ?? this.user.avatar;
      this.user.email = currentUser.email ?? this.user.email;
      this.user.name = currentUser.displayName ?? this.user.name;
      this.user.isOnline = false;
    }
    const promise = signOut(this.firebaseAuth);
    this.router.navigate(['/login']);
    return from(promise);
  }
}
