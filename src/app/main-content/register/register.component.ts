import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  contactData = {
    name: '',
    email: '',
    password: '',
  };

  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);  

  errorMessage: string | null = null;

  onSubmit(): void{
    this.authService
      .register(this.contactData.email, this.contactData.name, this.contactData.password)
      .subscribe({
        next: () => {
       this.router.navigateByUrl('/');
    },
    error: (err) => {
      this.errorMessage = err.code; 
    }
  });

    // this.authService
    //   .register(this.contactData.email, this.contactData.name, this.contactData.password)
    //   .subscribe(() => {
    //    this.router.navigateByUrl('/');
    // })

  }
}
