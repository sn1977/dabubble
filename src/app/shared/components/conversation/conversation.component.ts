import {CommonModule} from '@angular/common';
import {Component, Input, OnInit, inject} from '@angular/core';
import {ChannelMessage} from '../../../../models/channel-message.class';
import {User} from '../../../../models/user.class';
import {FirebaseService} from '../../services/firebase.service';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {EmojiPickerComponent} from '../emoji-picker/emoji-picker.component';
import {AuthService} from '../../services/auth.service';
import {FormsModule} from '@angular/forms';
import {DateFormatService} from '../../services/date-format.service';
import {Channel} from '../../../../models/channel.class';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { addDoc, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-conversation',
  standalone: true,
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
  imports: [CommonModule, MatDialogModule, EmojiPickerComponent, FormsModule, RouterLink],
})
export class ConversationComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    public dateFormatService: DateFormatService,
    private route: ActivatedRoute,
  ) {
    this.getCurrentDay();
  }

  firestore = inject(FirebaseService);
  authService = inject(AuthService);
  

  edit: boolean = false;
  hovered: boolean = false;
  isMessageFromYou: boolean = false;
  previousDate?: any;
  currentDate: any;
  messageDate: any;
  isToday: boolean = false;
  emojiCharacter: string = '';
  isEmojiSelected: boolean = false;
  emojiReactions: { emoji: string, count: number }[] = [];
  contentCount: number = 0;
  user: User = new User();
  channel: Channel = new Channel();
  itemID: any = '';

  userData = {
    avatar: this.user.avatar,
    email: this.user.email,
    displayName: this.user.displayName,
    isOnline: this.user.isOnline,
    provider: this.user.provider,
    selected: this.user.selected,
    count: this.user.count,
    newMessage: this.user.newMessage

  };

  channelData = {
    creator: this.channel.creator,
    description: this.channel.description,
    member: this.channel.member,
    name: this.channel.name,
    count: this.channel.count,
    newMessage: this.channel.newMessage

  };

  addCountToChannelDocument(toggle: string) {

    const channel = new Channel({
      creator: this.channel.creator,
      description: this.channel.description,
      member: this.channel.member,
      name: this.channel.name,
      count: this.contentCount,
      newMessage: this.channel.newMessage

    });

    const user = new User({
      avatar: this.user.avatar,
      email: this.user.email,
      displayName: this.user.displayName,
      isOnline: this.user.isOnline,
      provider: this.user.provider,
      selected: this.user.selected,
      count: this.contentCount,
      newMessage: this.user.newMessage
    });

    this.firestore.updateChannel(this.itemID, channel);
    this.firestore.updateUser(user, this.itemID, );
  }

  countContentElements(): void {
    const contentDivs = document.querySelectorAll('.content');
    this.contentCount = contentDivs.length;
    this.contentCount--;
    console.log('Anzahl der "content"-Elemente:', this.contentCount);


  }

  getCurrentDay() {
    const date = new Date();
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString();
    this.currentDate = year + month + day;
  }

  ngOnInit(): void {
    
    this.countContentElements();

    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');

      this.getItemValues('channels', this.itemID);
      this.getItemValuesTwo('users', this.itemID);

      setTimeout(() => {
         this.addCountToChannelDocument(this.itemID);
      }, 1000)
    });
  }

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
      this.setOldChannelValues();

    });
  }

  setOldChannelValues(){
    this.channelData = {
      creator: this.channel.creator,
      description: this.channel.description,
      member: this.channel.member,
      name: this.channel.name,
      count: this.channel.count,
      newMessage: this.channel.newMessage
    };
  }

  getItemValuesTwo(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);   
      this.setOldUserValuesTwo();
      
    });
  }

  setOldUserValuesTwo(){
    this.userData = {
      avatar: this.user.avatar,
      email: this.user.email,
      displayName: this.user.displayName,
      isOnline: this.user.isOnline,
      provider: this.user.provider,
      selected: this.user.selected,
      count: this.user.count,
      newMessage: this.user.newMessage
    };

  }

  deleteHovered() {
    if (!this.edit) {
      this.hovered = false;
    }
  }

  openEmojiPicker(): void {
    const dialogRef = this.dialog.open(EmojiPickerComponent, {
      width: '400px',
      height: '300px',
    });

    dialogRef.componentInstance.emojiSelect.subscribe(selectedEmoji => {
      console.log('Empfangenes Emoji:', selectedEmoji);
      // this.updateEmoji(selectedEmoji);
      this.addEmojiReaction(selectedEmoji);
      dialogRef.close();
    });
  }

  // updateEmoji(selectedEmoji: string) {
  //   console.log('Update Emoji auf:', selectedEmoji);
  //   this.emojiCharacter = selectedEmoji;
  // }

  addEmojiReaction(selectedEmoji: string) {
    const existingEmoji = this.emojiReactions.find(e => e.emoji === selectedEmoji);
    if (existingEmoji) {
      existingEmoji.count++;
    } else {
      this.emojiReactions.push({emoji: selectedEmoji, count: 1});
    }
    console.log('Emoji-Reaktionen:', this.emojiReactions);
    // this.updateEmoji();
  }

  // updateEmoji() {
  //   console.log('Hallo');
  //   const message = new ChannelMessage({
  //     creator: this.authService.activeUserId,
  //     text: this.textBoxData.messageText,
  //     channelId: this.textBoxData.channelId,
  //     createdAt: this.textBoxData.createdAt,
  //     reactions:  this.emojiReactions,
  //     collection: this.textBoxData.collection,
  //     subcollection: this.textBoxData.subcollection,
  //     attachment: 'Anhang',
  //   });
  //
  //   this.firestore.addChannelMessage(message, `${this.textBoxData.collection}/${message.channelId}/${this.textBoxData.subcollection}`);
  //   console.log(this.emojiReactions);
  // }
}
