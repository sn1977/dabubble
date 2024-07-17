import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardImage,
} from '@angular/material/card';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { User } from '../../../../models/user.class';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ChooseAvatarComponent } from '../../auth/register/choose-avatar/choose-avatar.component';
import { UploadService } from '../../../shared/services/upload.service';
import 'firebase/auth';
import 'firebase/firestore';
import { MemberService } from '../../../shared/services/member-service.service';
import { Auth } from '@angular/fire/auth';
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { VerificationEmailDialogComponent } from '../../auth/verification-email-dialog/verification-email-dialog.component';

@Component({
  selector: 'app-edit-profil-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardImage,
    NgOptimizedImage,
    ReactiveFormsModule,
    FormsModule,
    MatCardActions,
    MatButton,
    CommonModule,
    VerificationEmailDialogComponent,
  ],
  templateUrl: './edit-profil-card.component.html',
  styleUrls: ['./edit-profil-card.component.scss'],
})
export class EditProfilCardComponent implements OnInit, OnDestroy {
  firebaseAuth = inject(Auth);
  authService = inject(AuthService);
  user: User = new User();
  templateIndex: number = 0;
  nameData = { name: '' };
  emailData = { email: '' };
  passwordData = { password: '' };
  namePlaceholder?: string;
  emailPlaceholder?: string;
  inputHasValue = false;
  showPasswordField = false;

  contactData = {
    name: '',
    email: '',
    password: '',
    photoURL: '',
  };

  selectedAvatar: FileList | undefined;
  file: any = undefined;
  filedate: number | undefined;
  errorMessage: string | null = null;
  fileType: string = '';
  maxSizeReached: boolean = false;
  currentUser: string = '';
  auth = getAuth();

  constructor(
    private firestore: FirestoreService,
    public dialogRef: MatDialogRef<EditProfilCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private uploadService: UploadService,
    public dialog: MatDialog, // Add MatDialog as a property
    private memberService: MemberService // private avatarService: AvatarService
  ) {}

  /**
   * Function which is called after Click on save-button with valid form
   */
  onSubmit() {
    this.saveProfile();
  }

  /**
   * Returns a unique identifier for each item in a collection.
   * This method is used as the trackBy function in Angular's ngFor directive.
   *
   * @param index - The index of the current item in the collection.
   * @param item - The current item in the collection.
   * @returns The unique identifier for the item.
   */
  trackByFn(index: number, item: any) {
    return index; // or item.id
  }

  /**
   * Updates the avatar of the member.
   *
   * @param newAvatarUrl - The URL of the new avatar.
   */
  updateMemberAvatar(newAvatarUrl: string) {
    this.memberService.updateMemberAvatar(
      this.authService.activeUserAccount.uid,
      newAvatarUrl
    );
  }

  /**
   * Handles the change event of the email input field.
   * Updates the visibility of the password field based on the email value.
   * @param value - The new value of the email input field.
   */
  onEmailChange(value: string): void {
    this.showPasswordField = value !== this.data.user.email;
  }

  /**
   * Updates the email for the current user.
   *
   * @returns {Promise<void>} A promise that resolves when the email is updated.
   */
  async updateEmailForUser() {
    const user = this.getCurrentUser();
    if (!user) return;
    const newEmail = this.emailData.email;
    const currentPassword = this.passwordData.password;
    if (newEmail && currentPassword) {
      await this.handleEmailUpdate(user, newEmail, currentPassword);
    }
  }

  /**
   * Retrieves the currently authenticated user.
   *
   * @returns The currently authenticated user, or `null` if no user is authenticated.
   */
  getCurrentUser() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    return user;
  }

  /**
   * Handles the update of the user's email address.
   *
   * @param user - The user object.
   * @param newEmail - The new email address to update.
   * @param currentPassword - The current password of the user.
   */
  async handleEmailUpdate(
    user: any,
    newEmail: string,
    currentPassword: string
  ) {
    const email = user.email;
    localStorage.setItem('newEmail', newEmail);
    try {
      const credentials = EmailAuthProvider.credential(email!, currentPassword);
      await reauthenticateWithCredential(user, credentials);
      await verifyBeforeUpdateEmail(user, newEmail, {
        url: window.location.href,
      });
      this.dialog.open(VerificationEmailDialogComponent);
    } catch (error: any) {
      console.error('Error updating email:', error.code, error.message);
      alert(`Error: ${error.message}`);
    } finally {
      localStorage.removeItem('newEmail');
    }
  }

  /**
   * Closes the dialog without performing any action.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Checks if the input value is empty or not.
   * @param value - The input value to check.
   */
  checkInput(value: string): void {
    this.inputHasValue = !!value.trim();
  }

  /**
   * Closes the edit profile card.
   */
  closeEditProfilCard() {
    this.dialogRef.close();
  }

  /**
   * Handles the focus event for the input fields.
   * Clears the placeholders for name and email.
   */
  onFocus() {
    this.namePlaceholder = '';
    this.emailPlaceholder = '';
  }

  /**
   * Initializes the component.
   * Subscribes to the user list and sets the initial values for name and email data.
   */
  ngOnInit() {
    this.firestore.subUserList(); // Abonniere die Benutzerliste

    this.nameData.name = this.data.user.displayName || '';
    this.emailData.email = this.data.user.email || '';
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * It unsubscribes from the Firestore users collection.
   */
  ngOnDestroy() {
    this.firestore.unsubUsers(); // Beende das Abonnement
  }

  /**
   * Saves the user profile if the input is valid.
   * Updates the user profile, user in Firestore, user photo URL, and email for the user.
   * Closes the dialog after updating the user in Firestore.
   */
  saveProfile(): void {
    this.updateUserProfile();
    this.updateUserInFirestore().then(() => this.closeDialog());
    this.updateUserPhotoURL();
    this.updateEmailForUser();
  }

  /**
   * Checks if the input values for name and email are valid.
   * @returns {boolean} True if both name and email inputs are valid, false otherwise.
   */
  // isValidInput(): boolean {
  //     return this.nameControl.valid && this.emailControl.valid;
  // }

  /**
   * Updates the user profile with the provided name and email data.
   * If the name data is empty, the display name remains unchanged.
   * If the email data is empty, the email remains unchanged.
   */
  updateUserProfile() {
    this.data.user.displayName =
      this.nameData.name || this.data.user.displayName;
    this.data.user.email = this.emailData.email || this.data.user.email;
  }

  /**
   * Updates the user in Firestore.
   *
   * @returns A promise that resolves when the user is successfully updated.
   */
  updateUserInFirestore(): Promise<void> {
    return this.firestore.updateUser(
      this.data.user,
      this.authService.activeUserAccount.uid
    );
  }

  /**
   * Closes the dialog.
   */
  closeDialog() {
    this.dialogRef.close();
  }

  /**
   * Updates the user's photo URL in the user data.
   * If the current user has a photo URL, it updates the user data with the name and photo URL.
   */
  updateUserPhotoURL() {
    if (this.firebaseAuth.currentUser?.photoURL) {
      this.authService.updateUserData(
        this.nameData.name,
        this.firebaseAuth.currentUser.photoURL
      );
    }
  }

  /**
   * Opens the avatar dialog.
   */
  openAvatarDialog(): void {
    this.dialog.open(ChooseAvatarComponent, {
      width: '80%',
      data: { user: this.contactData },
    });
  }

  /**
   * Uploads a single file and updates the user's avatar.
   */
  uploadSingleFile2() {
    if (this.selectedAvatar) {
      this.file = this.selectedAvatar.item(0);

      if (this.file?.size && this.file?.size <= 500000) {
        this.maxSizeReached = false;
        this.filedate = new Date().getTime();
        this.fileType = this.file.type;
        this.uploadService
          .uploadFile(this.file, this.filedate, 'character')
          .then((url: string) => {
            this.updateAuthService(url);
            this.data.user.avatar = url;
            this.authService.activeUserAccount.photoURL = url;
            this.updateMemberAvatar(url);
          })
          .catch((error) => {
            this.errorMessage = error.code;
          });
      } else {
        this.maxSizeReached = true;
      }
    }
  }

  /**
   * Updates the authentication service with the given URL.
   *
   * @param url - The URL to update the authentication service with.
   */
  updateAuthService(url: string) {
    this.authService.updateUserData(this.user.displayName!, url);
  }

  /**
   * Updates the selected avatar based on the user's input and triggers the upload of the file.
   * @param event - The event object containing information about the selected files.
   */
  detectAvatar(event: any) {
    this.selectedAvatar = event.target.files;
    this.uploadSingleFile2();
  }

  /**
   * Sets the avatar for the user.
   *
   * @param event - The event object triggered by the avatar selection.
   */
  setAvatar(event: any) {
    this.data.user.avatar = event.target.src;
    this.updateAuthService(event.target.src);
  }
}
