import { Component, Input, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-verify-and-change-email',
  standalone: true,
  imports: [],
  templateUrl: './verify-and-change-email.component.html',
  styleUrl: './verify-and-change-email.component.scss',
})
export class VerifyAndChangeEmailComponent implements OnInit {
  authService = inject(AuthService);
  @Input() oobCode!: string;

  ngOnInit(): void {    
    this.authService.handleVerifyEmail(this.oobCode);
  }
}
