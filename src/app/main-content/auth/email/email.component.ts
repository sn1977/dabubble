import { Component, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { ResetPasswordComponent } from "../reset-password/reset-password.component";
import { VerifyAndChangeEmailComponent } from "../verify-and-change-email/verify-and-change-email.component";

@Component({
    selector: 'app-email',
    standalone: true,
    templateUrl: './email.component.html',
    styleUrl: './email.component.scss',
    imports: [NgIf, ResetPasswordComponent, VerifyAndChangeEmailComponent]
})
export class EmailComponent{
  authService = inject(AuthService);
  mode: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: { get: (arg0: string) => string | null; keys: any; }) => {
      this.mode = params.get('mode');
      // console.log('Mode:', this.mode);
      console.log('All Params:', params.keys);
      console.log(this.authService.activeUserAccount);
    });
  }

  // test(): void {
  //   this.route.queryParamMap.subscribe((params: { get: (arg0: string) => any; }) => {
  //     const mode = params.get('mode');
  //     // console.log('Mode from test function:', mode);
  //   });
  // }

  // https://dabubble-152.developerakademie.net/email/__/auth/action
  // https://firebase.google.com/docs/auth/custom-email-handler?hl=de&authuser=0
  
  getParameterByName(arg0: string) {
    throw new Error('Function not implemented.');
  }

  // handleResetPassword(auth: any, actionCode: any, continueUrl: any) {
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