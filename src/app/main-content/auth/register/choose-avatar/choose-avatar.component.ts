import { HttpClient } from '@angular/common/http';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
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
import { UploadService } from '../../../../shared/services/upload.service';
import { timestamp } from 'rxjs';

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

  /**
   * The HttpClient instance used for making HTTP requests.
   */
  http = inject(HttpClient);
  /**
   * The authentication service used for user authentication.
   */
  authService = inject(AuthService);
  /**
   * The router instance for navigating between routes.
   */
  router = inject(Router);
  /**
   * The error message displayed in the choose-avatar component.
   */
  errorMessage: string | null = null;
  /**
   * The index of the template to be used in the choose-avatar component.
   */
  templateIndex: number = 0;
  /**
   * The current avatar image path.
   */
  currentAvatar: any = './assets/img/characters/profile.svg';
  /**
   * Indicates whether the user has chosen an avatar.
   */
  chooseAvatar: boolean | undefined;
  /**
   * Indicates whether the confirmation has been made.
   */
  confirm: boolean = false;
  /**
   * Represents the selected files for avatar upload.
   */
  selectedFiles: FileList | undefined;
  /**
   * The date of the file.
   */
  filedate: number | undefined;

  /**
   * Represents the ChooseAvatarComponent class.
   * This component is responsible for handling the avatar selection functionality during user registration.
   */
  constructor(private uploadService: UploadService) {}

  /**
   * Handles the form submission.
   * If the contactData has a photoURL, it calls the registerUser method.
   * Otherwise, it sets the chooseAvatar flag to true.
   */
  onSubmit(): void {
    if (this.contactData.photoURL) {
      this.registerUser();
    } else {
      this.chooseAvatar = true;
    }
  }
  
  /**
   * Registers a user by calling the register method of the authService.
   * Subscribes to the register method's observable and handles the response.
   */
  registerUser(): void {
    this.authService
      .register(
        this.contactData.email,
        this.contactData.name,
        this.contactData.password,
        this.contactData.photoURL
      )
      .subscribe({
        complete: () => this.navigateAfterRegistration(),
        next: () => (this.confirm = true),
        error: (err) => this.handleError(err),
      });
  }
  
  /**
   * Navigates to the main page after registration.
   * 
   * This method uses a setTimeout function to delay the navigation by 3500 milliseconds (3.5 seconds).
   * After the delay, it navigates to the '/main' route using the Angular router.
   */
  navigateAfterRegistration(): void {
    setTimeout(() => {
      this.router.navigate(['/main']);
    }, 3500);
  }
  
  /**
   * Handles the error that occurred during the registration process.
   * @param err - The error object.
   */
  handleError(err: any): void {
    this.errorMessage = err.code;
  }

  /**
   * Sets the avatar based on the selected image element.
   * Updates the currentAvatar and contactData.photoURL properties.
   * Hides the chooseAvatar component.
   * 
   * @param event - The mouse event triggered by selecting an image.
   */
  setAvatar(event: MouseEvent) {
    const imgElement = event.target as HTMLImageElement;
    this.currentAvatar = imgElement.src;
    this.contactData.photoURL = this.currentAvatar;
    this.chooseAvatar = false;
  }

  /**
   * Handles the file detection event.
   * @param event - The file detection event.
   */
  detectFile(event: any) {
    this.selectedFiles = event.target.files;
    this.uploadSingleFile();
  }

  /**
   * Uploads a single file and updates the current avatar and contact data.
   */
  uploadSingleFile() {
    if (this.selectedFiles) {
      let file = this.selectedFiles.item(0);
      if (file) {

        this.filedate = new Date().getTime();
        this.uploadService
          .uploadFile(file, this.filedate, 'character')
          .then((url: string) => {
            this.currentAvatar = url;
            this.contactData.photoURL = this.currentAvatar;
            this.chooseAvatar = false;            
          })
          .catch((error) => {
            this.errorMessage = error.code;
          });
      }
    }
  }
}