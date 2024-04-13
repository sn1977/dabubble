import {Component, Inject} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from '@angular/material/card';
import {NgOptimizedImage} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {User} from '../../../models/user.class';

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
    MatButton
  ],
  templateUrl: './edit-profil-card.component.html',
  styleUrl: './edit-profil-card.component.scss'
})
export class EditProfilCardComponent {
  user: User = new User();

  nameData = {
    email: '',
  };

  emailData = {
    email: '',
  };

  inputHasValue = false;

  constructor(
    public dialogRef: MatDialogRef<EditProfilCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }) {
    // console.log('Übergebene Benutzerdaten:', this.data.user);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  checkInput(value: string): void {
    this.inputHasValue = !!value.trim();
  }

  closeEditProfilCard() {
    this.dialogRef.close()
  }

}
