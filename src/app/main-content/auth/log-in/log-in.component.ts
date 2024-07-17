import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MatchMediaService } from '../../../shared/services/match-media.service';
import { DesktopFooterComponent } from '../../../shared/components/desktop-footer/desktop-footer.component';

@Component({
  selector: 'app-log-in',
  standalone: true,
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
  imports: [
    MatCardModule,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    RouterLink,
    CommonModule,
    DesktopFooterComponent,
  ],
})
export class LogInComponent implements OnInit {
  /**
   * Represents the contact data for the user.
   */
  contactData = {
    name: '',
    email: '',
    password: '',
  };
  /**
   * The HttpClient instance used for making HTTP requests.
   */
  http = inject(HttpClient);
  /**
   * The authentication service used for logging in.
   */
  authService = inject(AuthService);
  /**
   * The matchMedia variable represents the MatchMediaService used for media query matching.
   */
  matchMedia = inject(MatchMediaService);
  /**
   * The router object for navigating between routes.
   */
  router = inject(Router);
  /**
   * Represents the error message for the login component.
   * This property can hold a string value or null.
   */
  errorMessage: string | null = null;
  /**
   * Specifies whether the intro animation should be played.
   */
  playIntroAnimation: string | null = null;
  /**
   * Indicates whether the current device is a desktop view.
   */
  isDesktopAnimation: boolean = false;

  /**
   * Represents the LogInComponent class.
   * This component is responsible for handling the login functionality.
   */
  constructor() {
    setTimeout(() => {
      if (this.authService.activeUserId) {
        this.redirectToMain();
      }
    }, 500);
  }

  /**
   * Initializes the component.
   * This method is called after the component has been created and initialized.
   */
  async ngOnInit(): Promise<void> {
    await this.checkFirstRun();
    this.isDesktopAnimation = this.matchMedia.checkIsDesktopAnimation();
    if(this.playIntroAnimation === null){
      localStorage.setItem('firstRunAnimation', 'done');
    }
  }

  /**
   * Check if animation should play
   */
  async checkFirstRun(){
    this.playIntroAnimation = localStorage.getItem('firstRunAnimation');
  }

  /**
   * Handles the form submission when the user clicks the submit button.
   * Calls the login method of the authService to authenticate the user.
   * If the login is successful, navigates to the '/main' route.
   * If there is an error, sets the errorMessage property to the error code.
   */
  onSubmit(): void {
    this.authService
      .login(this.contactData.email, this.contactData.password)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/main');
        },
        error: (err) => {
          this.errorMessage = err.code;
        },
      });
  }

  /**
   * Logs out the user.
   */
  logout(): void {    
    this.authService.logout();
  }

  /**
   * Signs in the user with Google using a redirect.
   * This method calls the `googleAuth` method of the `authService`.
   */
  signInWithGoogleRedirect() {
    this.authService.googleAuth();
  }

  /**
   * Performs an anonymous login.
   */
  anonymousLogin() {
    this.authService.signInAnonymous();
  }

  /**
   * Performs an guest login.
   */
  guestLogin(): void {
    this.authService
      .login('gast@dabubble.com', 'gastlogin')
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/main');
        },
        error: (err) => {
          this.errorMessage = err.code;
        },
      });
  }

  /**
   * Redirects the user to the main page.
   */
  redirectToMain() {
    this.router.navigateByUrl('/main');
  }
}
