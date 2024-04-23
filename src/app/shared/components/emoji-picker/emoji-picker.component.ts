import { Component, EventEmitter, Output } from '@angular/core';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {PickerComponent} from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [
    PickerComponent
  ],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {
  @Output() emojiSelect = new EventEmitter<EmojiEvent>();

  onEmojiSelect(event: EmojiEvent) {
    this.emojiSelect.emit(event);
    // Hier kannst du den Dialog schließen, wenn das Emoji ausgewählt wurde.
  }
}
