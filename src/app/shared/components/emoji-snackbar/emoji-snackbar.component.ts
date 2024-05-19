import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import {PositionService} from '../../services/position.service';

@Component({
  selector: 'app-emoji-snackbar',
  standalone: true,
  imports: [],
  templateUrl: './emoji-snackbar.component.html',
  styleUrl: './emoji-snackbar.component.scss'
})
export class EmojiSnackbarComponent {
  @ViewChild('emojiSnackbar') emojiSnackbar!: ElementRef;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any, private positionService: PositionService) {
    this.positionService.position$.subscribe(position => {
      this.setPopUpEmojiPosition(position.top, position.left);
    });
  }

  setPopUpEmojiPosition(top: number, left: number) {
    const element = this.emojiSnackbar.nativeElement;
    element.style.position = 'absolute';
    element.style.top = `${top}px`;
    element.style.left = `${left}px`;
  }
}
