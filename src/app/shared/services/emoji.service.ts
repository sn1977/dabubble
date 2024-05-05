import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Emoji, EmojiData, EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  private emojis = new BehaviorSubject<Emoji[]>([]);

  constructor() {
    this.loadEmojis();
  }

  private loadEmojis() {
    // Beispielsweise Emoji-Daten laden
    const rawEmojis: EmojiData[] = this.fetchEmojis(); // Ersetzen Sie dies durch Ihren Aufruf
    const transformedEmojis = rawEmojis.map(emoji => this.transformToEmoji(emoji));
    this.emojis.next(transformedEmojis);
  }

  getEmojis() {
    return this.emojis.asObservable();
  }

  private transformToEmoji(data: EmojiData): Emoji {
    return {
      isNative: false,
      forceSize: false,
      tooltip: false,
      skin: 1,
      sheetSize: 32,
      set: 'apple',
      size: 24,
      emoji: data.shortName,  // Dies könnte an Ihre Daten angepasst werden
      backgroundImageFn: () => `${data.spriteUrl}`,  // Passen Sie die URL-Generierung an
      emojiOver: new EventEmitter<EmojiEvent>(),
      emojiLeave: new EventEmitter<EmojiEvent>(),
      emojiClick: new EventEmitter<EmojiEvent>()
    };
  }

  private fetchEmojis(): EmojiData[] {
    // Diese Methode soll Ihre Emoji-Daten abrufen
    return [];
  }
}
