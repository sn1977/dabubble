import {Component, inject, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from '@angular/material/card';
import {NgOptimizedImage} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {User} from '../../../models/user.class';
import {FirebaseService} from '../../shared/services/firebase.service';
import {AuthService} from '../../shared/services/auth.service';

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
export class EditProfilCardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  user: User = new User();

  nameData = {
    name: '',
  };

  emailData = {
    email: '',
  };

  inputHasValue = false;

  constructor(
    private firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<EditProfilCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }) {
    console.log('Übergebene Benutzerdaten:', this.data.user);
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

  ngOnInit() {
    this.firebaseService.subUserList();  // Abonniere die Benutzerliste
  }

  ngOnDestroy() {
    // Dies ist ein Beispiel, wenn `subUserList` das Abonnement direkt zurückgeben würde.
    // Wenn nicht, musst du eine andere Art von Verwaltung implementieren.
    this.firebaseService.unsubUsers();  // Beende das Abonnement
  }

  saveProfile(): void {
    // Aktualisiere das User-Objekt mit neuen Daten aus den Formularfeldern
    this.data.user.displayName = this.nameData.name;
    this.data.user.email = this.emailData.email;

    this.firebaseService.updateUser(this.data.user, this.authService.activeUserAccount.uid).then(() => {
      // console.log('Profil aktualisiert');
      // console.log(this.authService.activeUserAccount.uid);
      // console.log(this.data.user);
      this.dialogRef.close();
    }).catch(error => {
      console.error('Fehler beim Aktualisieren des Profils:', error);
    });
  }
}
