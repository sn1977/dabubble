import {Component, inject} from '@angular/core';
import {MatNavList} from '@angular/material/list';
import {MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatLine} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {ProfilCardComponent} from '../profil-card/profil-card.component';
import {MatCardModule} from '@angular/material/card';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from '../../shared/services/auth.service';


@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [
    MatNavList,
    MatBottomSheetModule,
    MatListModule,
    MatButtonModule,
    MatLine,
    MatIcon
  ],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss'
})
export class BottomSheetComponent {
  authService = inject(AuthService);
  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>, public dialog: MatDialog) {}

  openProfileCard(): void {
    const dialogRef = this.dialog.open(ProfilCardComponent, {
      width: '400px',
      height: '600px',
      // Weitere Konfigurationen nach Bedarf
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Der Dialog wurde geschlossen');
      // Weitere Aktionen nach dem Schließen des Dialogs
    });
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
