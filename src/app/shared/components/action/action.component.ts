import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
    getAuth,
    applyActionCode,
    verifyPasswordResetCode,
} from "firebase/auth";
import { Router } from "@angular/router";
import { EmailUpdateService } from "../../services/email-update.service";

@Component({
    selector: "app-action",
    standalone: true,
    imports: [],
    templateUrl: "./action.component.html",
    styleUrl: "./action.component.scss",
})
export class ActionComponent implements OnInit {
    constructor(private route: ActivatedRoute, private router: Router, private emailUpdateService: EmailUpdateService ) {}

  //   ngOnInit() {
  //       this.route.queryParams.subscribe((params) => {
  //           const mode = params["mode"];
  //           const actionCode = params["oobCode"];
  //           const continueUrl = params["continueUrl"];
  //           const auth = getAuth();

  //           switch (mode) {
  //               case "resetPassword":
  //                   this.handleResetPassword(auth, actionCode);
  //                   break;
  //               case "verifyEmail":
  //                   this.handleVerifyEmail(auth, actionCode);
  //                   break;
  //               default:
  //                   console.error("Unknown mode: " + mode);
  //           }
  //       });
  //   }

  //   handleResetPassword(auth: any, actionCode: string) {
  //     verifyPasswordResetCode(auth, actionCode).then((email) => {
  //         console.log('Password reset code verified for email:', email);
  //         this.router.navigate(['/reset-password'], { queryParams: { oobCode: actionCode } });
  //     }).catch(error => {
  //         console.error('Error verifying password reset code:', error);
  //         this.router.navigate(['/error-page']);
  //     });
  // }

  // handleVerifyEmail(auth: any, actionCode: string) {
  //     applyActionCode(auth, actionCode).then(() => {
  //         console.log('Email verified successfully.');
  //         this.router.navigate(['/login']);
  //     }).catch(error => {
  //         console.error('Error applying action code:', error);
  //         this.router.navigate(['/error-page']);
  //     });
  // }

//   confirmEmailUpdate() {
//     // Hole die neue E-Mail-Adresse aus dem Local Storage oder Session Storage
//     const newEmail = localStorage.getItem('newEmail');
//     const editProfilCardComponentInstance = new EditProfilCardComponent(/* Abhängigkeiten */);
//     editProfilCardComponentInstance.updateEmailAfterVerification(newEmail);
//     this.router.navigate(['/login']);
// }

ngOnInit() {
  this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      const actionCode = params['oobCode'];
      const auth = getAuth();

      switch (mode) {
          case 'verifyEmail':
              this.handleVerifyEmail(auth, actionCode);
              break;
          default:
              console.error('Unknown mode: ' + mode);
              this.router.navigate(['/error-page']);
      }
  });
}

handleVerifyEmail(auth: any, actionCode: string) {
  applyActionCode(auth, actionCode).then(() => {
      console.log('Email verified successfully.');
      const newEmail = localStorage.getItem('newEmail');
      if (newEmail) {
          this.emailUpdateService.updateEmailAfterVerification(newEmail);
          localStorage.removeItem('newEmail'); // clean Local Storage
          alert('Email successfully updated to: ' + newEmail);
      }
      this.router.navigate(['/action']);
  }).catch(error => {
      console.error('Error applying action code:', error);
      this.router.navigate(['/error-page']);
  });
}
}
