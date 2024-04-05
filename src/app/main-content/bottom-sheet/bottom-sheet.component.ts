import {Component} from '@angular/core';
import {MatNavList} from '@angular/material/list';
import {MatBottomSheetModule, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatLine} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';


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
  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>) {}

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
