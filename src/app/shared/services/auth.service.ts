import {Injectable, inject, signal} from '@angular/core';
import {
  ActionCodeSettings,
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
} from '@angular/fire/auth';
import {Observable, from} from 'rxjs';
import {UserInterface} from '../interfaces/user.interface';
import {Router} from '@angular/router';
import {FirebaseService} from './firebase.service';
import {User} from '../../../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  user: User = new User();

  constructor(private router: Router, private firebase: FirebaseService) {
  }

  register(
    email: string,
    username: string,
    password: string,
    photoURL: string,
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((response) => {
      updateProfile(response.user, {displayName: username});
      const currentUser = this.firebaseAuth.currentUser;
      if (currentUser) {
        this.user.id = currentUser.uid ?? this.user.id;
        this.user.avatar = currentUser.photoURL ?? this.user.avatar;
        this.user.email = currentUser.email ?? this.user.email;
        this.user.name = username ?? this.user.name;
        this.firebase.addUser(this.user, this.user.id);
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
    });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    this.router.navigate(['/login']);
    return from(promise);
  }

  sendMailToResetPassword(email: string, actionCodeSettings?: ActionCodeSettings | undefined): Observable<void> {
  const promise = sendPasswordResetEmail(
    this.firebaseAuth,
      email,
  ).then(() => {
    window.alert('Password reset email sent, check your inbox.');
  });
  return from(promise);
  }
}
