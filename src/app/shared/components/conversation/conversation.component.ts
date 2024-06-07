import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { User } from '../../../../models/user.class';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { DateFormatService } from '../../services/date-format.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PositionService } from '../../services/position.service';
import { SnackbarOverlayService } from '../../services/snackbar-overlay.service';
import { Router } from '@angular/router';
import { MatchMediaService } from '../../services/match-media.service';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-conversation',
  standalone: true,
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
  imports: [CommonModule, MatDialogModule, EmojiPickerComponent, FormsModule],
})
export class ConversationComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private dialog: MatDialog,
    public dateFormatService: DateFormatService,
    private snackBar: MatSnackBar,
    private positionService: PositionService,
    private snackbarOverlayService: SnackbarOverlayService
  ) {
    this.previousMessageDate = '';
  }

  firestore = inject(FirestoreService);
  router = inject(Router);
  matchMedia = inject(MatchMediaService);
  authService = inject(AuthService);
  @Input() channelMessage!: ChannelMessage;
  @Input() isChannel!: boolean;
  @Input() isThread!: boolean;
  @Input() hideCompleteReactionBar: boolean = false;
  @Input() index!: number;
  user: User = new User();
  edit: boolean = false;
  hovered: boolean = false;
  isMessageFromYou: boolean = false;
  messageDate: any;
  showReactionBar: boolean = false;
  showEditMessage: boolean = false;
  isMessageDisabled: boolean = true;
  showEmojiSnackbarTile: boolean = false;
  savedMessage: string = '';
  isDesktop: boolean = false;
  @ViewChild('messageToEdit') messageToEdit!: ElementRef<HTMLTextAreaElement>;
  previousMessageDate: string;
  mainCollection: Subscription | undefined;

  async ngOnInit(): Promise<void> {
    await this.delay(200);
    this.getItemValuesProfile('users', this.channelMessage.creator);
    this.isMessageFromYou =
      this.authService.activeUserAccount.uid === this.channelMessage.creator;

    if (this.channelMessage.messageId !== undefined) {
      const docRef =
        this.channelMessage.channelId +
        '/channelmessages/' +
        this.channelMessage.messageId;
      this.mainCollection = this.firestore
        .getChannelData(docRef)
        .subscribe((data) => {
          //console.log('MainCollection Data in Component:', data);
          // this.channelMessage.channelId = data['channelId'];
          this.channelMessage.creator = data['creator'];
          this.channelMessage.createdAt = data['createdAt'];
          this.channelMessage.text = data['text'];
          this.channelMessage.reactions = data['reactions'];
          this.channelMessage.attachment = data['attachment'];
          this.channelMessage.threads = data['threads'];
          this.adjustTextareaHeight(this.messageToEdit.nativeElement);
          this.fillEmojiReactions();
        });
    }
  }

  async ngAfterViewInit() {
    await this.delay(200);
    this.adjustTextareaHeight(this.messageToEdit.nativeElement);
  }

  ngOnDestroy() {
    if (this.mainCollection) {
      this.mainCollection.unsubscribe();
    }
  }

  fillEmojiReactions() {
    const filterEmojisWithUsers = (data: any[]) => {
      return data.filter((entry) => entry.users.length > 0);
    };

    const filteredData = filterEmojisWithUsers(this.channelMessage.reactions);

    this.channelMessage.reactions = filteredData;
    this.saveMessage();
  }

  showEmojiSnackbar(emoji: string, user: string) {
    const reactionGroupDiv = document.querySelector('.reaction-group');
    if (reactionGroupDiv) {
      const rect = reactionGroupDiv.getBoundingClientRect();
      const snackbarHeight = 100; // Ersetzen Sie dies durch die tatsächliche Höhe Ihrer Snackbar
      const snackbarWidth = 200; // Ersetzen Sie dies durch die tatsächliche Breite Ihrer Snackbar
      this.snackbarOverlayService.open({
        top: rect.top - snackbarHeight,
        left: rect.left,
        emoji,
        user,
      });
    } else {
      console.error(
        'Element mit der Klasse "reaction-group pointer" wurde nicht gefunden'
      );
    }
  }

  async getItemValuesProfile(collection: string, itemID: string) {
    await this.delay(200);
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
    });
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

    dialogRef.componentInstance.emojiSelect.subscribe((selectedEmoji) => {
      this.addEmojiReaction(selectedEmoji);
      dialogRef.close();
    });
  }

  addEmojiReaction(selectedEmoji: string) {
    const existingEmoji = this.channelMessage.reactions.find(
      (e) => e.emoji === selectedEmoji
    );
    const userId = this.authService.activeUserAccount.uid;

    if (existingEmoji) {
      if (!existingEmoji.users.includes(userId)) {
        existingEmoji.users.push(userId);
      }
    } else {
      this.channelMessage.reactions.push({
        emoji: selectedEmoji,
        users: [userId],
      });
    }

    this.saveMessage();

    this.showEmojiSnackbar(
      selectedEmoji,
      this.authService.activeUserAccount.displayName
    );
  }

  getUserReactionCount(selectedEmoji: string): number {
    const existingEmoji = this.channelMessage.reactions.find(
      (e) => e.emoji === selectedEmoji
    );
    if (existingEmoji && existingEmoji.users) {
      const uniqueUsers = new Set(existingEmoji.users);
      return uniqueUsers.size;
    } else {
      return 0;
    }
  }

  toggleReaction(reaction: { emoji: string; users: string[] }): void {
    const userIndex = reaction.users.indexOf(
      this.authService.activeUserAccount.uid
    );
    if (userIndex === -1) {
      reaction.users.push(this.authService.activeUserAccount.uid);
    } else {
      reaction.users.splice(userIndex, 1);
    }
    this.saveMessage();

    this.showEmojiSnackbar(
      reaction.emoji,
      this.authService.activeUserAccount.displayName
    );
  }

  toggleReactionBar(event: any): void {
    event.preventDefault();
    this.showReactionBar = !this.showReactionBar;
    if (!this.showReactionBar) {
      const setFocusMessage = this.messageToEdit.nativeElement;
      setFocusMessage.classList.remove('edit-message');
      this.isMessageDisabled = true;
      this.showEditMessage = false;
    }
  }

  doNotClose(event: any): void {
    event.stopPropagation();
  }

  toggleEditMessage(event: any): void {
    event.preventDefault();
    this.showEditMessage = !this.showEditMessage;
  }

  editMessage(id?: string): void {
    if (id) {
      this.isMessageDisabled = false;
      const setFocusMessage = this.messageToEdit.nativeElement;
      setFocusMessage.classList.add('edit-message');

      if (setFocusMessage.value) {
        this.savedMessage = setFocusMessage.value;
        setTimeout(() => {
          this.showEditMessage = false;
          this.showReactionBar = false;
          this.messageToEdit.nativeElement.focus();
        }, 200);
      }
    }
  }

  noChanges() {
    const setFocusMessage = this.messageToEdit.nativeElement;
    setFocusMessage.value = this.savedMessage;

    setTimeout(() => {
      this.showEditMessage = false;
      this.showReactionBar = false;
      this.isMessageDisabled = true;
      setFocusMessage.classList.remove('edit-message');
    }, 200);
  }

  async changeMessage() {
    let messageId = this.channelMessage.messageId;

    if (messageId) {
      const setFocusMessage = this.messageToEdit.nativeElement;
      this.channelMessage.text = setFocusMessage.value;
      this.saveMessage();

      setTimeout(() => {
        setFocusMessage.classList.remove('edit-message');
        this.isMessageDisabled = true;
        this.showReactionBar = false;
      }, 200);
    }
  }

  saveMessage() {
    if (this.channelMessage.messageId !== undefined) {
      this.firestore.saveMessageData(
        'channels',
        this.channelMessage.channelId,
        this.channelMessage.messageId,
        this.channelMessage
      );
    }
  }

  async adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    await this.delay(100);
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  async openThread() {
    this.matchMedia.showThread = false;
    this.matchMedia.hideReactionIcons = false;
    await this.delay(200);

    const docId = this.channelMessage.channelId;
    const messageId = this.channelMessage.messageId;
    this.isDesktop = this.matchMedia.checkIsDesktop();

    if (messageId) {
      this.matchMedia.channelId = docId;
      this.matchMedia.subID = messageId;

      if (this.isDesktop === true) {
        this.matchMedia.showThread = true;
      } else {
        this.matchMedia.hideReactionIcons = true;
        this.router.navigate(['/thread']);
      }
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
