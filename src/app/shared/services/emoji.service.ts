import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import { Emoji, EmojiData, EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {

  // private reactionsSource = new BehaviorSubject<string[]>([]);
  // reactions$ = this.reactionsSource.asObservable();
  //
  // addReaction(emoji: string) {
  //   let currentReactions = this.reactionsSource.value;
  //   if (!currentReactions.includes(emoji)) {
  //     currentReactions.push(emoji);
  //     this.reactionsSource.next(currentReactions);
  //   }
  // }
  //
  // clearReactions() {
  //   this.reactionsSource.next([]);
  // }

  // Observable string sources
  private emojiClickedSource = new Subject<string>();

  // Observable string streams
  emojiClicked$ = this.emojiClickedSource.asObservable();

  // Service message commands
  emojiClicked(emoji: string) {
    this.emojiClickedSource.next(emoji);
  }
}
