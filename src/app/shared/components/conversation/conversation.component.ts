import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { User } from '../../../../models/user.class';
import { FirebaseService } from '../../services/firebase.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { DateFormatService } from '../../services/date-format.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEncapsulation } from '@angular/core';
import { EmojiSnackbarComponent } from '../emoji-snackbar/emoji-snackbar.component';
import { PositionService } from '../../services/position.service';
import { SnackbarOverlayService } from '../../services/snackbar-overlay.service';

@Component({
  selector: 'app-conversation',
  standalone: true,
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
  imports: [CommonModule, MatDialogModule, EmojiPickerComponent, FormsModule],
  encapsulation: ViewEncapsulation.None,
})
export class ConversationComponent implements OnInit {
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
  authService = inject(AuthService);
  @Input() channelMessage!: ChannelMessage;
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
  @ViewChild('myInput') myInput!: ElementRef<HTMLInputElement>;

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
    this.isLoading = true;
    this.getAnswers();

    //NOTE - @Sascha: Hier befüllen wir das noch leere Array mit den Daten aus der Datenbank
    this.fillEmojiReactions();
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

  // showEmojiSnackbar(emoji: string, user: string) {
  //   this.snackBar.open(`${emoji} \n ${user} hat reagiert`, '', {
  //     duration: 2000, // Die Dauer in Millisekunden, für die der Snackbar angezeigt wird
  //   });
  // }

  // showEmojiSnackbar(emoji: string, user: string) {
  //   this.snackBar.openFromComponent(EmojiSnackbarComponent, {
  //     data: { emoji: emoji, user: user },
  //     duration: 2000,
  //     panelClass: ['custom-snackbar']
  //   });
  // }

  // showEmojiSnackbar(emoji: string, user: string) {
  //   this.setReactionGroupPosition();
  //   this.snackBar.openFromComponent(EmojiSnackbarComponent, {
  //     data: { emoji: emoji, user: user },
  //     duration: 2500,
  //   });
  // }

  showEmojiSnackbar(emoji: string, user: string) {
    const reactionGroupDiv = document.querySelector('.reaction-group.pointer');
    if (reactionGroupDiv) {
      const rect = reactionGroupDiv.getBoundingClientRect();
      const snackbarHeight = 48; // Ersetzen Sie dies durch die tatsächliche Höhe Ihrer Snackbar
      const snackbarWidth = 200; // Ersetzen Sie dies durch die tatsächliche Breite Ihrer Snackbar
      this.snackbarOverlayService.open({
        // top: rect.top - snackbarHeight,
        // left: rect.right - snackbarWidth,
        emoji,
        user,
      });
    } else {
      console.error(
        'Element mit der Klasse "reaction-group pointer" wurde nicht gefunden'
      );
    }
  }

  setReactionGroupPosition() {
    const reactionGroupDiv = document.querySelector('.reaction-group .pointer');
    if (reactionGroupDiv) {
      const rect = reactionGroupDiv.getBoundingClientRect();
      this.positionService.setPosition(rect.top, rect.left);
    } else {
      console.error(
        'Element mit der Klasse "reaction-group pointer" wurde nicht gefunden'
      );
    }
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

  testMap() {
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
      this.authService.activeUserAccount.displayName
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
      this.authService.activeUserAccount.displayName
    );
  }

  toggleReactionBar(event: any): void {
    event.preventDefault();
    this.showReactionBar = !this.showReactionBar;
    if (!this.showReactionBar) {
      this.showEditMessage = false;
      this.isMessageDisabled = true;
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
      const setFocusMessage = this.myInput.nativeElement.value;
      if (setFocusMessage) {
        setTimeout(() => {
          this.showEditMessage = false;
          this.showReactionBar = false;
          this.myInput.nativeElement.focus();
        }, 200);
      } else {
        console.log('nicht gefunden');
      }
    }
  }

  changeMessage(event: any, id?: string): void {
    if (id) {
      console.log(id);
      console.log(this.myInput.nativeElement.value);
      // this.firestore.updateSingleMessageText();
    }
    this.isMessageDisabled = true;
  }
}