import {Component, Inject} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-profil-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, NgOptimizedImage],
  templateUrl: './profil-card.component.html',
  styleUrl: './profil-card.component.scss',
})
export class ProfilCardComponent {
  constructor(public dialogRef: MatDialogRef<ProfilCardComponent>) {}

  @Inject(MAT_DIALOG_DATA) public data: any

  onNoClick(): void {
    this.dialogRef.close();
  }
}
