import {CommonModule} from '@angular/common';
import {Component, Input, OnInit, inject} from '@angular/core';
import {ChannelMessage} from '../../../../models/channel-message.class';
import {User} from '../../../../models/user.class';
import {FirebaseService} from '../../services/firebase.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {EmojiPickerComponent} from '../emoji-picker/emoji-picker.component';
import {AuthService} from '../../services/auth.service';
import {FormsModule} from '@angular/forms';
import {DateFormatService} from '../../services/date-format.service';
import {serverTimestamp} from '@angular/fire/firestore';

@Component({
  selector: 'app-conversation',
  standalone: true,
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
  imports: [CommonModule, MatDialogModule, EmojiPickerComponent, FormsModule],
})
export class ConversationComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    public dateFormatService: DateFormatService
  ) {
    this.getCurrentDay();
   }

  firestore = inject(FirebaseService);
  authService = inject(AuthService);
  @Input() channelMessage!: ChannelMessage;
  @Input() index!: number;
  user: User = new User();
  edit: boolean = false;
  hovered: boolean = false;
  isMessageFromYou: boolean = false;
  currentDate: any;
  messageDate: any;
  emojiReactions: { emoji: string; count: number }[] = [];

  getCurrentDay() {
    const date = new Date();
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString();
    this.currentDate = year + month + day;
  }



  ngOnInit(): void {
    this.getItemValuesProfile('users', this.channelMessage.creator);
    this.messageDate = this.channelMessage.createdAt;
    this.isMessageFromYou =
      this.authService.activeUserAccount.uid === this.channelMessage.creator;
    this.initializeEmojiReactions();
  }

  getItemValuesProfile(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
  }

  deleteHovered() {
    if (!this.edit) {
      this.hovered = false;
    }
  }

  initializeEmojiReactions(): void {
    // Only initialize emojiReactions if it is not already initialized
    if (this.emojiReactions.length === 0) {
      // Get the emoji reactions from Firestore
      this.firestore.getEmojiReactions(this.channelMessage.channelId, this.channelMessage.messageId)
        .then(reactions => {
          this.emojiReactions = reactions;
        })
        .catch(error => {
          console.error("Error getting emoji reactions: ", error);
        });
    }
  }

  testMap() {
    let channelMessageInstance = new ChannelMessage(this.channelMessage);

    channelMessageInstance.messageId = this.channelMessage.messageId;
    channelMessageInstance.reactions = this.emojiReactions;

    // Update the channel message in Firestore with the new reactions
    if (channelMessageInstance.messageId && channelMessageInstance.messageId !== '') {
      this.firestore.updateChannelMessage(
        channelMessageInstance.channelId,
        channelMessageInstance.messageId,
        channelMessageInstance
      );
    }
  }

  openEmojiPicker(): void {
    const dialogRef = this.dialog.open(EmojiPickerComponent, {
      width: '400px',
      height: '300px',
    });

    dialogRef.componentInstance.emojiSelect.subscribe((selectedEmoji) => {
      console.log('Empfangenes Emoji:', selectedEmoji);
      // this.updateEmoji(selectedEmoji);
      this.addEmojiReaction(selectedEmoji);
      dialogRef.close();
      this.testMap();
    });
  }

  addEmojiReaction(selectedEmoji: string) {
    const existingEmoji = this.emojiReactions.find(
      (e) => e.emoji === selectedEmoji
    );
    if (existingEmoji) {
      existingEmoji.count++;
    } else {
      this.emojiReactions.push({emoji: selectedEmoji, count: 1});
    }
    console.log('Emoji-Reaktionen:', this.emojiReactions);
  }

  toggleReaction(reaction: any): void {
    if (!reaction.toggled) {
      reaction.count++;
      reaction.toggled = true;
    } else {
      reaction.count--;
      reaction.toggled = false;
    }
    // this.testMap();
  }

  // toggleReactionBar(event: any): void {
  //   event.preventDefault();
  //   console.log('hallo');
  //
  //   //showReactionBar =
  //
  // }
}

/*import {CommonModule} from '@angular/common';
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
  @Input() channelMessage!: ChannelMessage;
  @Input() index!: number;


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

  }

  channelData = {
    creator: this.channel.creator,
    description: this.channel.description,
    member: this.channel.member,
    name: this.channel.name,
    count: this.channel.count,
    newMessage: this.channel.newMessage,
    allMembers: this.channel.allMembers

  };

  addCountToChannelDocument(toggle: string) {

    /*const channel = new Channel({
      creator: this.channel.creator,
      description: this.channel.description,
      member: this.channel.member,
      name: this.channel.name,
      count: this.contentCount,
      newMessage: this.channel.newMessage,
      allMembers: this.channel.allMembers

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

    //this.firestore.updateChannel(this.itemID, channel);
    this.firestore.updateUser(user, this.itemID, );
  }

  countContentElements(): void {
    const contentDivs = document.querySelectorAll('.content');
    this.contentCount = contentDivs.length;
    this.contentCount--;



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

      //this.getItemValues('channels', this.itemID);
      this.getItemValuesTwo('users', this.itemID);

      setTimeout(() => {
         this.addCountToChannelDocument(this.itemID);
      }, 1000)
    });
  }

  /*getItemValues(collection: string, itemID: string) {
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
      newMessage: this.channel.newMessage,
      allMembers: this.channel.allMembers
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

  toggleReaction(reaction: any): void {
    if (!reaction.toggled) {
      reaction.count++;
      reaction.toggled = true;
    } else {
      reaction.count--;
      reaction.toggled = false;
    }
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
}*/
