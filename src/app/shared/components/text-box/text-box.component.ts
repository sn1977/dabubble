import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  inject,
  Renderer2,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelMessage } from '../../../../models/channel-message.class';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { UploadService } from '../../services/upload.service';
import { serverTimestamp } from '@angular/fire/firestore';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MatDialog } from '@angular/material/dialog';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { MatchMediaService } from '../../services/match-media.service';

@Component({
  selector: 'app-text-box',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss',
})
export class TextBoxComponent implements AfterViewInit {
  authService = inject(AuthService);
  firestore = inject(FirestoreService);
  reactions = [];
  selectedFiles: FileList | undefined | null;
  file: any = undefined;
  filedate: number | undefined;
  errorMessage: string | null = null;
  openEmojiPicker: boolean = false;
  fileType: string = '';
  maxSizeReached: boolean = false;
  @Input() isThread!: boolean;
  @Input() isNewMessage!: boolean;
  @Input() textBoxData: any;
  @ViewChild('messageText') messageText!: ElementRef<HTMLTextAreaElement>;
  private initialHeight: string = '';
  matchMedia = inject(MatchMediaService);

  add_hovered: boolean = false;
  smile_hovered: boolean = false;
  email_hovered: boolean = false;
  send_hovered: boolean = false;

  constructor(
    private uploadService: UploadService,
    private dialog: MatDialog,
    private renderer: Renderer2
  ) {}

  /**
   * Adds an emoji to the message text.
   * 
   * @param event - The EmojiEvent object containing the selected emoji.
   */
  addEmoji(event: EmojiEvent) {
    const { emoji } = event;
    this.textBoxData.messageText += emoji.native;
  }

  /**
   * Sets the hovered state of the delete button to false.
   */
  deleteHovered() {
    this.add_hovered = false;
    this.smile_hovered = false;
    this.email_hovered = false;
    this.send_hovered = false;
  }

  //TODO - split function!!!
  onSubmit() {
    this.matchMedia.showSearchDropdown = false;
    if (this.textBoxData.messageText != '') {
      this.textBoxData.subcollection;
      let type: string | undefined;
      const message = new ChannelMessage({
        creator: this.authService.activeUserId,
        text: this.textBoxData.messageText,
        channelId: this.textBoxData.channelId,
        createdAt: serverTimestamp(),
        reactions: (this.textBoxData.reactions = this.reactions),
        attachment: [`${this.textBoxData.inputField}`],
        threads: 0,        
        recipient: this.textBoxData.recipient,
      });

      if (this.textBoxData.subcollection != 'channelmessages') {
        type = 'thread';
      }

      if (
        !this.isNewMessage &&
        this.isNewMessage != undefined &&
        !this.matchMedia.inputValid
      ) {
      } else {        
        let colID = '';
        if (this.matchMedia.collectionType === 'messages') {
          colID = 'messages';
        } else {
          colID = 'channels';
        }

        this.firestore.addChannelMessage(
          message,
          `${colID}/${message.channelId}/${this.textBoxData.subcollection}`,
          type
        );
      }

      this.textBoxData.inputField = '';
      this.selectedFiles = null;
      this.file = undefined;
      this.textBoxData.messageText = '';
      this.resetTextareaHeight();

      if (this.isNewMessage === false && this.matchMedia.inputValid === true) {
        this.matchMedia.newMessage = true;
      }
    }
  }
  
  isMessageSendable() {
    return this.isNewMessage || (this.isNewMessage === undefined && this.matchMedia.inputValid);
  }
  
  resetForm() {
    this.textBoxData.inputField = '';
    this.selectedFiles = null;
    this.file = undefined;
    this.textBoxData.messageText = '';
    this.resetTextareaHeight();
  }
  
  updateNewMessageStatus() {
    if (this.isNewMessage === false && this.matchMedia.inputValid === true) {
      this.matchMedia.newMessage = true;
    }
  }

  /**
   * Submits the form when the submit button is clicked.
   * 
   * @param event - The event object triggered by the submit button click.
   */
  submitForm(event: any) {
    event.preventDefault();
    if (this.textBoxData.messageText.trim() !== '') {
      this.onSubmit();
    }
  }

  /**
   * Handles the file detection event.
   * 
   * @param event - The file detection event.
   */
  detectFile(event: any) {
    this.selectedFiles = event.target.files;
    this.uploadSingleFile();
  }

  /**
   * Uploads a single file.
   */
  uploadSingleFile() {
    if (this.selectedFiles) {
      this.file = this.selectedFiles.item(0);
      if (this.file?.size && this.file?.size <= 500000) {
        this.maxSizeReached = false;
        this.filedate = new Date().getTime();
        this.fileType = this.file.type;

        this.uploadService
          .uploadFile(this.file, this.filedate, 'attachments')
          .then((url: string) => {
            this.textBoxData.inputField = url;
          })
          .catch((error) => {
            this.errorMessage = error.code;
          });
      } else {
        this.maxSizeReached = true;
      }
    }
  }

  /**
   * Opens the emoji picker dialog.
   * 
   * This method opens a dialog that allows the user to select an emoji. 
   * When an emoji is selected, it is added to the text box and the dialog is closed.
   */
  openEmojiPickerDialog(): void {
    const dialogRef = this.dialog.open(EmojiPickerComponent, {
      width: '400px',
      height: '300px',
    });

    dialogRef.componentInstance.emojiSelect.subscribe((event: string) => {
      this.addEmoji({ emoji: { native: event } } as EmojiEvent);
      dialogRef.close();
    });
  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized the component's view.
   * It is called only once after the first `ngAfterContentChecked`.
   * Use this hook to perform any additional initialization tasks that require the view to be fully rendered.
   */
  ngAfterViewInit() {
    const textarea = this.messageText.nativeElement;
    this.initialHeight = textarea.style.height || 'auto';
    this.adjustTextareaHeight(textarea);
    this.setFocus();
  }

  /**
   * Adjusts the height of a textarea element based on its content.
   * @param textarea - The HTMLTextAreaElement to adjust the height of.
   */
  adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.focus();
  }

  /**
   * Sets the focus on the message text element.
   */
  setFocus() {
    this.renderer.selectRootElement(this.messageText.nativeElement).focus();
  }

  /**
   * Resets the height of the textarea to its initial height.
   */
  resetTextareaHeight() {
    const textarea = this.messageText.nativeElement;
    textarea.style.height = this.initialHeight;
  }
}
