import {CommonModule} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {ChannelMessage} from '../../../../models/channel-message.class';
import {User} from '../../../../models/user.class';
import {FirebaseService} from '../../services/firebase.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {EmojiPickerComponent} from '../emoji-picker/emoji-picker.component';
// import { Router } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {FormsModule} from '@angular/forms';
import {DateFormatService} from '../../services/date-format.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ViewEncapsulation} from '@angular/core';
import {EmojiSnackbarComponent} from '../emoji-snackbar/emoji-snackbar.component';
import {PositionService} from '../../services/position.service';
import {SnackbarOverlayService} from '../../services/snackbar-overlay.service';
import {Router} from '@angular/router';
import {MatchMediaService} from '../../services/match-media.service';

@Component({
  selector: 'app-conversation',
  standalone: true,
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
  imports: [
    CommonModule,
    MatDialogModule,
    EmojiPickerComponent,
    FormsModule
  ],
})
export class ConversationComponent implements OnInit, AfterViewInit {
  constructor(
    private dialog: MatDialog,
    public dateFormatService: DateFormatService,
    private snackBar: MatSnackBar,
    private positionService: PositionService,
    private snackbarOverlayService: SnackbarOverlayService
  ) {
    this.getCurrentDay();
  }

  firestore = inject(FirebaseService);
  router = inject(Router);
  matchMedia = inject(MatchMediaService);
  authService = inject(AuthService);
  @Input() channelMessage!: ChannelMessage;
  @Input() isChannel!: boolean;
  @Input() isThread!: boolean;
  @Input() index!: number;
  user: User = new User();
  edit: boolean = false;
  hovered: boolean = false;
  isMessageFromYou: boolean = false;
  currentDate: any;
  messageDate: any;
  //NOTE - @Sascha - hier starten wir immer mit einem leeren Array
  emojiReactions: { emoji: string; users: string[] }[] = [];
  showReactionBar: boolean = false;
  showEditMessage: boolean = false;
  isLoading: boolean = true;
  answerCount: number = 0;
  lastAnswerTime: any;
  isMessageDisabled: boolean = true;
  showEmojiSnackbarStefan: boolean = false;
  savedMessage: string = '';
  isDesktop: boolean = false;
  @ViewChild('messageToEdit') messageToEdit!: ElementRef<HTMLTextAreaElement>;

  getCurrentDay() {
    const date = new Date();
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString();
    this.currentDate = year + month + day;
  }

  async ngOnInit(): Promise<void> {
    await this.delay(200);
    this.getItemValuesProfile('users', this.channelMessage.creator);
    this.messageDate = this.channelMessage.createdAt;
    this.isMessageFromYou = this.authService.activeUserAccount.uid === this.channelMessage.creator;
    this.fillEmojiReactions();
  }

  async ngAfterViewInit() {
    await this.delay(200);
    this.adjustTextareaHeight(this.messageToEdit.nativeElement);
    this.isLoading = true;
    await this.getAnswers();
  }

  ngOnDestroyy() {
    this.isLoading = true;
  }

  fillEmojiReactions() {
    if (this.channelMessage.reactions) {
      this.emojiReactions = this.emojiReactions.concat(
        this.channelMessage.reactions
      );
    }
  }

  showEmojiSnackbar(emoji: string, user: string) {
    const reactionGroupDiv = document.querySelector('.reaction-group.pointer');
    if (reactionGroupDiv) {
      const rect = reactionGroupDiv.getBoundingClientRect();
      const snackbarHeight = 48; // Ersetzen Sie dies durch die tatsächliche Höhe Ihrer Snackbar
      const snackbarWidth = 200; // Ersetzen Sie dies durch die tatsächliche Breite Ihrer Snackbar
      this.snackbarOverlayService.open({
        // top: rect.top - snackbarHeight,
        // left: rect.right - snackbarWidth,
        top: 200,
        left: 200,
        emoji,
        user,
      });
    } else {
      console.error(
        'Element mit der Klasse "reaction-group pointer" wurde nicht gefunden'
      );
    }
  }

  // showEmojiSnackbar(emoji: string, user: string, event: MouseEvent) {
  //   const clickedElement = event.target as HTMLElement;
  //   const rect = clickedElement.getBoundingClientRect();
  //   const snackbarHeight = 48; // Ersetzen Sie dies durch die tatsächliche Höhe Ihrer Snackbar
  //   const snackbarWidth = 200; // Ersetzen Sie dies durch die tatsächliche Breite Ihrer Snackbar
  //   this.snackbarOverlayService.open({
  //     top: rect.top - snackbarHeight,
  //     left: rect.right - snackbarWidth,
  //     emoji,
  //     user,
  //   });
  // }

  // setReactionGroupPosition() {
  //   const reactionGroupDiv = document.querySelector('.reaction-group .pointer');
  //   if (reactionGroupDiv) {
  //     const rect = reactionGroupDiv.getBoundingClientRect();
  //     this.positionService.setPosition(rect.top, rect.left);
  //   } else {
  //     console.error(
  //       'Element mit der Klasse "reaction-group pointer" wurde nicht gefunden'
  //     );
  //   }
  // }

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

  async testMap() {
    await this.delay(200);
    let channelMessageInstance = new ChannelMessage(this.channelMessage);

    channelMessageInstance.messageId = this.channelMessage.messageId;
    channelMessageInstance.reactions = this.emojiReactions;

    // Update the channel message in Firestore with the new reactions
    if (
      channelMessageInstance.messageId &&
      channelMessageInstance.messageId !== ''
    ) {
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
      // Add the user to the list of users who reacted with this emoji
      existingEmoji.users.push(this.authService.activeUserAccount.uid);
    } else {
      // If the emoji does not exist yet, create a new entry with the user
      this.emojiReactions.push({
        emoji: selectedEmoji,
        users: [this.authService.activeUserAccount.uid],
      });
    }
    console.log('Emoji-Reaktionen:', this.emojiReactions);

    // Show the snackbar
    this.showEmojiSnackbar(
      selectedEmoji,
      this.authService.activeUserAccount.displayName,
    );
  }

  getUserReactionCount(selectedEmoji: string): number {
    const existingEmoji = this.emojiReactions.find(
      (e) => e.emoji === selectedEmoji
    );
    if (existingEmoji && existingEmoji.users) {
      // Zählt die Anzahl der Reaktionen des aktuellen Benutzers auf das Emoji
      return existingEmoji.users.length;
    } else {
      // Wenn das Emoji noch nicht existiert, ist die Anzahl der Reaktionen 0
      return 0;
    }
  }

  toggleReaction(reaction: { emoji: string; users: string[] }): void {
    console.log(reaction.users.indexOf(this.authService.activeUserAccount.uid));
    const userIndex = reaction.users.indexOf(
      this.authService.activeUserAccount.uid
    );
    if (userIndex === -1) {
      // If the user has not reacted with this emoji yet, add them to the list
      reaction.users.push(this.authService.activeUserAccount.uid);
    } else {
      // If the user has already reacted with this emoji, remove them from the list
      reaction.users.splice(userIndex, 1);
    }
    this.updateReactionsInDatabase();

    // Show the snackbar
      this.showEmojiSnackbar(
        reaction.emoji,
        this.authService.activeUserAccount.displayName,
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

  updateReactionsInDatabase(): void {
    let channelMessageInstance = new ChannelMessage(this.channelMessage);
    channelMessageInstance.messageId = this.channelMessage.messageId;
    channelMessageInstance.reactions = this.emojiReactions;

    // Update the channel message in Firestore with the new reactions
    if (
      channelMessageInstance.messageId &&
      channelMessageInstance.messageId !== ''
    ) {
      this.firestore.updateChannelMessage(
        channelMessageInstance.channelId,
        channelMessageInstance.messageId,
        channelMessageInstance
      );
    }
  }

  doNotClose(event: any): void {
    event.stopPropagation();
  }

  async getAnswers() {
    await this.delay(100);
    try {
      const data = await this.firestore.getThreadData(
        this.channelMessage.channelId,
        this.channelMessage.messageId
      );

      this.answerCount = data.threadCount;
      this.lastAnswerTime = data.newestCreatedAt;
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
    } finally {
      this.isLoading = false;
    }
  }

  toggleEditMessage(event: any): void {
    event.preventDefault();
    this.showEditMessage = !this.showEditMessage;
  }

  editMessage(event: any, id?: string): void {
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
      } else {
        console.log('nicht gefunden');
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
    await this.delay(100);
    const colId = this.isChannel == true ? 'channels' : 'messages';
    const docId = this.channelMessage.channelId;
    const messageId = this.channelMessage.messageId;

    if (messageId) {
      const setFocusMessage = this.messageToEdit.nativeElement;
      this.firestore.updateSingleMessageText(
        colId,
        docId,
        messageId,
        setFocusMessage.value
      );

      setTimeout(() => {
        setFocusMessage.classList.remove('edit-message');
        this.isMessageDisabled = true;
        this.showReactionBar = false;
      }, 200);
    }
  }

  async adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    await this.delay(100);
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  async openThread() {
    this.matchMedia.showThread = false;
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
        this.router.navigate(['/thread']);
      }
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
