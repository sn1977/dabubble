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
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
 
  contactData = {
    name: '',
    email: '',
    password: '',
    photoURL: ''
  };
  
  router = inject(Router);

  errorMessage: string | null = null;
  updateContactData: any;

  onSubmit(): void {
    
    if (this.contactData.name && this.contactData.email && this.contactData.password) {
      console.log(this.contactData);
      // Übergebe die contactData-Variable an die Kindkomponente
      // Das Kindkomponente kann jetzt auf die Daten über die Input-Eigenschaft zugreifen
      // Triggere ein Ereignis und übergebe die Daten
      this.updateContactData.emit(this.contactData);
      this.router.navigateByUrl('/choose-avatar');
    }

    // this.authService
    //   .register(
    //     this.contactData.email,
    //     this.contactData.name,
    //     this.contactData.password,
    //     this.contactData.photoURL
    //   )
    //   .subscribe({
    //     next: () => {
    //       // Bestätigung anzeigen
    //       this.router.navigateByUrl('/');
    //     },
    //     error: (err) => {
    //       this.errorMessage = err.code;
    //     },
    //   });
    // const dialog = this.dialog.open(ChooseAvatarComponent, {});
    // dialog.componentInstance.user = new User(this.user.toJSON());
    // dialog.componentInstance.userID = this.userID;



  }
}
