import { Component, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-verification-email-dialog',
  standalone: true,
  imports: [],
  templateUrl: './verification-email-dialog.component.html',
  styleUrl: './verification-email-dialog.component.scss',
})
export class VerificationEmailDialogComponent {
  authService = inject(AuthService);  

  constructor(private dialog: DialogRef) {
    setTimeout(() => {
      this.authService.logout();
      this.dialog.close(VerificationEmailDialogComponent);
    }, 2500);

  }
}
