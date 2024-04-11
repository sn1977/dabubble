import { HttpClient } from '@angular/common/http';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
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
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-choose-avatar',
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
    RouterLink,
  ],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss',
})
export class ChooseAvatarComponent {
  @Input() contactData: any;

  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);

  errorMessage: string | null = null;
  templateIndex: number = 0;
  currentAvatar: string = './assets/img/characters/profile.svg';
  chooseAvatar: boolean | undefined;
  confirm: boolean = false;

  onSubmit(): void {
    if (this.contactData.photoURL) {
      this.authService
        .register(
          this.contactData.email,
          this.contactData.name,
          this.contactData.password,
          this.contactData.photoURL
        )
        .subscribe({
          next: () => {
            this.confirm = true;

            setTimeout(() => {
              this.authService.logout();
              this.router.navigateByUrl('/login');
            }, 3500);
          },
          error: (err) => {
            this.errorMessage = err.code;
          },
        });
    } else {
      this.chooseAvatar = true;
    }    
  }

  setAvatar(event: MouseEvent) {
    const imgElement = event.target as HTMLImageElement;
    this.currentAvatar = imgElement.src;
    this.contactData.photoURL = this.currentAvatar;
    this.chooseAvatar = false;
  }
}