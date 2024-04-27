import {Component, EventEmitter, Output} from '@angular/core';
import {EmojiEvent} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {PickerComponent} from '@ctrl/ngx-emoji-mart';
import {MatDialogRef} from '@angular/material/dialog';

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
  @Output() emojiSelect = new EventEmitter<string>();

  constructor(private dialogRef: MatDialogRef<EmojiPickerComponent>) {}

  onEmojiSelect(event: EmojiEvent) {
    console.log('Ausgewähltes Emoji:', event.emoji.native);
    // this.emojiSelect.emit(event);
    this.emojiSelect.emit(event.emoji.native);
    // Hier kannst du den Dialog schließen, wenn das Emoji ausgewählt wurde.
    this.dialogRef.close(event.emoji.native);
  }
}
