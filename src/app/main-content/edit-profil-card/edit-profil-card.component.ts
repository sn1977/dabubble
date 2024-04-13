import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from '@angular/material/card';
import {NgOptimizedImage} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {User} from '../../../models/user.class';
import {FirebaseService} from '../../shared/services/firebase.service';

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

  ngOnInit() {
    this.firebaseService.subUserList();  // Abonniere die Benutzerliste
  }

  ngOnDestroy() {
    // Dies ist ein Beispiel, wenn `subUserList` das Abonnement direkt zurückgeben würde.
    // Wenn nicht, musst du eine andere Art von Verwaltung implementieren.
    this.firebaseService.unsubUsers();  // Beende das Abonnement
  }

  saveProfile(): void {
    console.log('Speichern');
    // if (this.data.user.id === undefined) {
    //   console.error('Benutzer-ID ist undefined');
    //   return;
    // }

  //   const updatedData = {
  //     name: this.nameData.name,  // Vermutlich solltest du den Variablennamen anpassen, da es verwirrend ist, dass `nameData.email` für den Namen verwendet wird.
  //     email: this.emailData.email
  //   };
  //
  //   this.firebaseService.updateUser(this.data.user.id!, updatedData).then(() => {
  //     console.log('Profil aktualisiert');
  //     this.dialogRef.close();  // Schließe den Dialog nach erfolgreicher Aktualisierung
  //   }).catch(error => {
  //     console.error('Fehler beim Aktualisieren des Profils:', error);
  //   });
  }
}
