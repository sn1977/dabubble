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
  updateEmail,
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

  resultGoogleAuth(user: any) {    
    this.user.id = user.uid;
    this.user.avatar = user.photoURL;
    this.user.email = user.email;
    this.user.displayName = user.displayName;
    this.user.isOnline = true;
    this.user.provider = 'google';
    this.router.navigateByUrl('/main');
    this.firestore.updateUser(this.user, this.user.id!);
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
        this.user.isOnline = true;
        this.user.provider = 'email';
        this.firestore.updateUser(this.user, this.user.id);
        this.sendMailVerification(currentUser);
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
        this.firestore.updateUser(this.user, this.user.id);
      }
    });
    return from(promise);
  }

  logout(): Promise<void> {
    const currentUser = this.firebaseAuth.currentUser;

    if (currentUser) {
      this.user.id = currentUser.uid ?? this.user.id;
      this.user.displayName = currentUser.displayName;
      this.user.isOnline = false;
      this.user.avatar = currentUser.photoURL;
      this.matchMedia.channelName = '';
      this.matchMedia.showThread = false;
      this.firestore.updateUser(this.user, this.user.id);
    }

    return new Promise<void>((resolve, reject) => {
      signOut(this.firebaseAuth)
        .then(() => {
          this.router.navigate(['/login']);
          this.user.isOnline = false;
          resolve();
        })
        .catch((error) => {
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

  sendMailVerification(currentUser: any): Observable<void> {
    // const auth = getAuth();
    const promise = sendEmailVerification(currentUser!).then(() => {
      console.log('Email verification sent!');
      // Email verification sent!
      // ...
    });
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
    const randomUserNumber = Math.floor(Math.random() * 301);
    const auth = getAuth();
    signInAnonymously(auth)
      .then(async (response) => {
        await updateProfile(response.user, {
          displayName: `Gast #${randomUserNumber}`,
          photoURL:
            './assets/img/characters/template' +
            randomInt +
            '.svg',
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

  get activeUserId(): string {
    return this.activeUserAccount ? this.activeUserAccount.uid : null;
  }

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

  verifyAndUpdateEmail(newAdresse: string){
    debugger
    const auth = getAuth();
    if (auth.currentUser) {
    // updateEmail(auth.currentUser, "user@example.com").then(() => {
    updateEmail(auth.currentUser, newAdresse).then(() => {
      // Email updated!
      console.log('Email updated!');
      
      // ...
    }).catch((error) => {
      // An error occurred
      console.log(error);      
      // ...
    });
  }

  }
}
