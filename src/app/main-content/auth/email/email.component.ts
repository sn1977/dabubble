import { Component, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { VerifyAndChangeEmailComponent } from '../verify-and-change-email/verify-and-change-email.component';

@Component({
  selector: 'app-email',
  standalone: true,
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss',
  imports: [NgIf, ResetPasswordComponent, VerifyAndChangeEmailComponent],
})
export class EmailComponent {
  authService = inject(AuthService);
  mode: string | null = null;
  oobCode: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(
      (params: { get: (arg0: string) => string | null; keys: any }) => {
        this.mode = params.get('mode');
        this.oobCode = params.get('oobCode');
      }
    );
  }

  getParameterByName(arg0: string) {
    throw new Error('Function not implemented.');
  }
}
