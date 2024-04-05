import { Component } from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {BottomSheetComponent} from '../../../main-content/bottom-sheet/bottom-sheet.component';

@Component({
  selector: 'app-header-mobile',
  standalone: true,
  imports: [
    BottomSheetComponent
  ],
  templateUrl: './header-mobile.component.html',
  styleUrl: './header-mobile.component.scss'
})
export class HeaderMobileComponent {
  constructor(private _bottomSheet: MatBottomSheet) {}

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }
}
