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
  getAuth,
  authState,
  signInAnonymously,
  sendEmailVerification,
  UserCredential,
  applyActionCode,
} from '@angular/fire/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { UserInterface } from '../interfaces/user.interface';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';
import { User } from '../../../models/user.class';
import { MatchMediaService } from './match-media.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  matchMedia = inject(MatchMediaService);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  user: User = new User();
  isDesktop: boolean = false;
  provider = new GoogleAuthProvider();
  activeUserAccount: any = null;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  /**
   * Constructs an instance of the AuthService class.
   * @param router - The router service.
   * @param firestore - The Firestore service.
   */
  constructor(private router: Router, private firestore: FirestoreService) {
    authState(this.firebaseAuth).subscribe((user) => {
      if (user) {
        this.currentUserSubject.next(this.user);
      } else {
        this.currentUserSubject.next(null);
      }
    });

    this.firebaseAuth.onAuthStateChanged(
      (user) => (this.activeUserAccount = user)
    );

    this.isDesktop = this.matchMedia.checkIsDesktop();
  }

  /**
   * Authenticates the user using Google Sign-In.
   */
  googleAuth() {
    const auth = getAuth();
    signInWithPopup(auth, this.provider)
      .then((result: UserCredential) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          const token = credential.accessToken;
        }
        const user = result.user;
        this.resultGoogleAuth(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }

  /**
   * Updates the user information after successful Google authentication.
   * @param user - The user object containing the authentication details.
   */
  resultGoogleAuth(user: any) {
    this.user.id = user.uid;
    this.user.avatar = user.photoURL;
    this.user.email = user.email;
    this.user.displayName = user.displayName;
    this.user.isOnline = true;
    this.user.provider = 'google';
    this.router.navigateByUrl('/main');
    this.firestore.updateUser(this.user, this.user.id!);
    this.resetValues();
  }

  /**
   * Registers a new user with the provided email, username, password, and photoURL.
   *
   * @param email - The email of the user.
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @param photoURL - The photo URL of the user.
   * @returns An Observable that emits void when the registration is successful.
   */
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
      this.updateUserProfile(response.user, username, photoURL);
      this.setUserDetails(response.user, username, photoURL);
    });
    return from(promise);
  }

  /**
   * Updates the user profile with the provided username and photoURL.
   *
   * @param user - The user object.
   * @param username - The new username.
   * @param photoURL - The new photo URL.
   */
  updateUserProfile(user: any, username: string, photoURL: string) {
    updateProfile(user, {
      displayName: username,
      photoURL: photoURL,
    });
  }

  /**
   * Sets the user details in the application.
   * @param user - The user object.
   * @param username - The username.
   * @param photoURL - The photo URL.
   */
  setUserDetails(user: any, username: string, photoURL: string) {
    const currentUser = this.firebaseAuth.currentUser;
    if (currentUser) {
      this.user.id = currentUser.uid ?? this.user.id;
      this.user.avatar = photoURL ?? this.user.avatar;
      this.user.email = currentUser.email ?? this.user.email;
      this.user.displayName = username ?? this.user.displayName;
      this.user.isOnline = true;
      this.user.provider = 'email';
      this.firestore.updateUser(this.user, this.user.id);
      this.sendMailVerification(currentUser);
    }
  }

  /**
   * Logs in a user with the provided email and password.
   *
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns An Observable that emits void when the login is successful.
   */
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
        this.firestore.updateUser(this.user, this.user.id);
        this.resetValues();
      }
    });
    return from(promise);
  }

   /**
   * Reset Values from previsous login
   */
   resetValues() {
    this.matchMedia.channelId = '';
    this.matchMedia.channelName = '';
  }

  /**
   * Logs out the current user.
   *
   * @returns A promise that resolves when the user is successfully logged out.
   */
  async logout(): Promise<void> {
    const currentUser = this.firebaseAuth.currentUser;
    if (currentUser) {
      await this.updateValues(currentUser);
    }

    return new Promise<void>((resolve, reject) => {
      signOut(this.firebaseAuth)
        .then(() => {
          this.router.navigate(['/login']);
          this.user.isOnline = false;
          this.resetValues();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Update values of the logged out user.   
   */
  async updateValues(currentUser: any) {
    this.user.id = currentUser.uid ?? this.user.id;
    this.user.displayName = currentUser.displayName;
    this.user.avatar = currentUser.photoURL;
    this.user.isOnline = false;
    this.matchMedia.channelName = '';
    this.matchMedia.showThread = false;
    await this.firestore.updateUser(this.user, this.user.id!);
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

  /**
   * Sends a mail verification to the current user.
   * @param currentUser - The current user object.
   * @returns An Observable that emits void when the mail verification is sent.
   */
  sendMailVerification(currentUser: any): Observable<void> {
    const promise = sendEmailVerification(currentUser!).then(() => {
      // console.log('Email verification sent!');
    });
    return from(promise);
  }

  /**
   * Resets the user's password using the provided action code and new password.
   *
   * @param {string} actionCode - The action code received by the user.
   * @param {string} newPassword - The new password to set for the user.
   * @returns {Promise<any>} - A promise that resolves when the password reset is successful, or rejects with an error.
   */
  resetPassword(actionCode: string, newPassword: string) {
    const auth = getAuth();
    verifyPasswordResetCode(auth, actionCode)
      .then(() => {
        confirmPasswordReset(auth, actionCode, newPassword)
          .then((resp) => {
            this.router.navigate(['/login']);
          })
          .catch((error) => {
            console.error('error during confirmation');
            return error;
          });
      })
      .catch((error) => {
        console.error('invalid code or email');
        return error;
      });
  }

  /**
   * Signs in the user anonymously.
   * Generates a random user number and random character avatar for the user.
   * Updates the user profile with the generated display name and avatar.
   * Sets the user's properties and navigates to the main page.
   * Returns a promise that resolves with the updated user data.
   */
  signInAnonymous() {
    const randomInt = Math.floor(Math.random() * 6) + 1;
    const randomUserNumber = Math.floor(Math.random() * 301);
    const auth = getAuth();
    signInAnonymously(auth)
      .then(async (response) => {
        await updateProfile(response.user, {
          displayName: `Gast #${randomUserNumber}`,
          photoURL: './assets/img/characters/template' + randomInt + '.svg',
        });
        const currentUser = this.firebaseAuth.currentUser;
        if (currentUser) {
          this.user.id = currentUser.uid ?? this.user.id;
          this.user.avatar = response.user.photoURL ?? this.user.avatar;
          this.user.email = '';
          this.user.displayName =
            response.user.displayName ?? this.user.displayName;
          this.user.provider = 'anonym';
          this.user.isOnline = true;
          this.router.navigateByUrl('/main');
          return this.firestore.updateUser(this.user, this.user.id);
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  /**
   * Gets the ID of the active user.
   * @returns The ID of the active user, or null if there is no active user.
   */
  get activeUserId(): string {
    return this.activeUserAccount ? this.activeUserAccount.uid : null;
  }

  /**
   * Updates the user data with the provided display name and photo URL.
   *
   * @param displayName - The new display name for the user.
   * @param url - The new photo URL for the user.
   */
  updateUserData(displayName: string, url: string) {
    const auth = getAuth();
    if (auth.currentUser) {
      updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: url,
      })
        .then(() => {})
        .catch((error) => {
          console.error('An error occurred!', error);
        });
    }
  }

  /**
   * Handles the verification of an email action code.
   *
   * @param actionCode - The action code to verify the email.
   */
  handleVerifyEmail(actionCode: string) {
    const auth = getAuth();
    applyActionCode(auth, actionCode)
      .then((resp) => {
        this.router.navigateByUrl('/login');
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
