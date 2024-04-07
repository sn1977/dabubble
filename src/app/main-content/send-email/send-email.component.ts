import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
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

@Component({
  selector: 'app-send-email',
  standalone: true,
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
    RouterLink
  ],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.scss'
})
export class SendEmailComponent {
  contactData = {    
    email: '',
  };

  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);

  errorMessage: string | null = null;

  onSubmit(): void {

    console.log('Kennwort zurücksetzen');
    

  //   this.authService
  //     .register(
  //       this.contactData.email,
  //       this.contactData.name,
  //       this.contactData.password,
  //       this.contactData.photoURL
  //     )
  //     .subscribe({
  //       next: () => {
  //         this.router.navigateByUrl('/');
  //       },
  //       error: (err) => {
  //         this.errorMessage = err.code;
  //       },
  //     });
  }
}
