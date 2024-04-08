import {Component, Inject} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from '@angular/material/card';
import {NgOptimizedImage} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EditProfilCardComponent} from '../edit-profil-card/edit-profil-card.component';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-direct-message-overlay',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardImage,
    NgOptimizedImage,
    MatCardActions,
    MatButton
  ],
  templateUrl: './direct-message-overlay.component.html',
  styleUrl: './direct-message-overlay.component.scss'
})
export class DirectMessageOverlayComponent {
  constructor(public dialogRef: MatDialogRef<DirectMessageOverlayComponent>, public dialog: MatDialog) {}

  @Inject(MAT_DIALOG_DATA) public data: any

  onNoClick(): void {
    this.dialogRef.close();
  }

  closeDirectMessageOverlay() {
    this.dialogRef.close()
  }

  openEditProfileCard(): void {
    const dialogRef = this.dialog.open(EditProfilCardComponent, {
      minWidth: '398px',
      minHeight: '600px',
      panelClass: 'custom-dialog-container',
      // Weitere Konfigurationen nach Bedarf
    });
    // this.closeProfilCard();
  }
}
