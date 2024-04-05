import { Component, inject } from '@angular/core';
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
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-log-in',
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
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {  

  contactData = {
    name: '',
    email: '',
    password: '',
  };
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);
  
  errorMessage: string | null = null;

  onSubmit(): void {
    this.authService
      .login(
        this.contactData.email,
        this.contactData.password
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/');
          console.log('login');
        },
        error: (err) => {
          this.errorMessage = err.code;
        },
      });
  }

  logout(): void {
    console.log('User logged out');
    this.authService.logout();
  }
}
