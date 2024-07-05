import { Component, Input, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { ProgressSpinnerComponent } from "../../../shared/components/progress-spinner/progress-spinner.component";

@Component({
    selector: 'app-verify-and-change-email',
    standalone: true,
    templateUrl: './verify-and-change-email.component.html',
    styleUrl: './verify-and-change-email.component.scss',
    imports: [ProgressSpinnerComponent]
})
export class VerifyAndChangeEmailComponent implements OnInit {
  authService = inject(AuthService);
  @Input() oobCode!: string;

  ngOnInit(): void {    
    this.authService.handleVerifyEmail(this.oobCode);
  }
}
