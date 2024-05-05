import { Component, EventEmitter, Output } from '@angular/core';
import { EmojiService } from '../../services/emoji.service';
import {Emoji, EmojiEvent} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss'],
  standalone: true,
  imports: [
    PickerComponent
  ]
})
export class EmojiPickerComponent {
  @Output() emojiSelect = new EventEmitter<string>();
  emojis: Emoji[] = [];

  constructor(private emojiService: EmojiService) {
    this.emojiService.getEmojis().subscribe(emojis => {
      this.emojis = emojis;
      console.log('Emojis bereit zur Anzeige:', this.emojis);
    });
  }

  // onEmojiSelect(emoji: Emoji) {
  //   this.emojiSelect.emit(emoji.native);
  //   console.log('Ausgewähltes Emoji:', emoji.native);
  // }

  // onEmojiSelect(emoji: Emoji) {
  //   if ('native' in emoji) {
  //     this.emojiSelect.emit(emoji.native); // Stellen Sie sicher, dass `native` existiert, bevor Sie es verwenden
  //     console.log('Ausgewähltes Emoji:', emoji.native);
  //   }
  // }

  onEmojiSelect(event: EmojiEvent) {
    if (event.emoji && event.emoji.unified) {
      this.emojiSelect.emit(this.convertToNative(event.emoji.unified));
      console.log('Ausgewähltes Emoji:', this.convertToNative(event.emoji.unified));
    }
  }

  convertToNative(unified: string): string {
    return unified.split('-')
      .map(u => String.fromCodePoint(parseInt(u, 16)))
      .join('');
  }
}


