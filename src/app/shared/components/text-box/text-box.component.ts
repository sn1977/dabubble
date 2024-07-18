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
import { ClickOutsideDirective } from '../../directives/clickoutside.directive';

@Component({
  selector: 'app-text-box',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent, ClickOutsideDirective],
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss',
})
export class TextBoxComponent implements AfterViewInit {
  authService = inject(AuthService);
  firestore = inject(FirestoreService);
  message: ChannelMessage = new ChannelMessage();
  reactions = [];
  tags: { read: boolean; user: string }[] = [];
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
  noInput: boolean = false;
  showUserDropdown: boolean = false;
  showChannelDropdown: boolean = false;

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

  /**
   * Prepare for save a new message after Submit
   */
  async onSubmit() {
    this.matchMedia.showSearchDropdown = false;
    if (
      this.messageText.nativeElement.value != '' ||
      this.textBoxData.inputField != ''
    ) {
      this.noInput = false;
      this.textBoxData.subcollection;
      await this.setMessageContent();

      if (
        this.isNewMessage ||
        this.isNewMessage === undefined ||
        this.matchMedia.inputValid
      ) {
        this.storeNewMessage();
      }
      await this.resetValuesAfterStore();
    } else {
      this.noInput = true;
    }
  }

  /**
   * Set necessary values and store in database
   */
  storeNewMessage() {
    let type: string | undefined;
    let colID = '';
    type =
      this.textBoxData.subcollection != 'channelmessages' ? 'thread' : type;
    colID =
      this.matchMedia.collectionType === 'messages' ? 'messages' : 'channels';

    this.firestore.addChannelMessage(
      this.message,
      `${colID}/${this.message.channelId}/${this.textBoxData.subcollection}`,
      type
    );
  }

  /**
   * Set object values
   */
  async setMessageContent() {
    this.message = new ChannelMessage({
      creator: this.authService.activeUserId,
      text: this.messageText.nativeElement.value,
      channelId: this.textBoxData.channelId,
      createdAt: serverTimestamp(),
      reactions: (this.textBoxData.reactions = this.reactions),
      attachment: [`${this.textBoxData.inputField}`],
      threads: 0,
      recipient: this.textBoxData.recipient,
      tags: this.tags,
    });
  }

  /**
   * Reset values after storage
   */
  async resetValuesAfterStore() {
    this.textBoxData.inputField = '';
    this.selectedFiles = null;
    this.file = undefined;
    this.textBoxData.messageText = '';
    this.messageText.nativeElement.value = '';
    this.showChannelDropdown = false;
    this.showUserDropdown = false;
    this.tags = [];

    this.resetTextareaHeight();
    if (this.isNewMessage === false && this.matchMedia.inputValid === true) {
      this.matchMedia.newMessage = true;
    }
  }

  /**
   * Check if message is valid
   */
  isMessageSendable() {
    return (
      this.isNewMessage ||
      (this.isNewMessage === undefined && this.matchMedia.inputValid)
    );
  }

  /**
   * Reset the form
   */
  resetForm() {
    this.textBoxData.inputField = '';
    this.selectedFiles = null;
    this.file = undefined;
    this.textBoxData.messageText = '';
    this.resetTextareaHeight();
  }

  /**
   * Update status
   */
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
   * Check keys
   * Submit on enter
   * Show User-Dropdown on @-char
   */
  checkKeys(event: any) {
    if (event.key === 'Enter') {
      this.submitForm(event);
    } else if (event.key === '@') {
      this.showUserDropdown = true;
      this.showChannelDropdown = false;
    } else if (event.key === '#') {
      this.showChannelDropdown = true;
      this.showUserDropdown = false;
    }
  }

  /**
   * Open Dropdown and add @-char
   */
  openUserDropdown() {
    if (!this.showUserDropdown) {
      this.showUserDropdown = true;
      this.messageText.nativeElement.value =
        this.messageText.nativeElement.value + '@';
    }
  }

  /**
   * Hide Dropdown and remove @-char if input ends with @-char
   */
  hideUserDropdown() {
    this.showUserDropdown = false;
    if (this.messageText.nativeElement.value.endsWith('@')) {
      this.messageText.nativeElement.value =
        this.messageText.nativeElement.value.slice(0, -1);
    }
  }

  /**
   * Hide Dropdown and remove @-char if input ends with @-char
   */
  hideChannelDropdown() {
    this.showChannelDropdown = false;
    if (this.messageText.nativeElement.value.endsWith('#')) {
      this.messageText.nativeElement.value =
        this.messageText.nativeElement.value.slice(0, -1);
    }
  }

  /**
   * Add user to input and hide Dropdown
   */
  selectUser(user: string, id: string) {
    this.showUserDropdown = false;
    this.showChannelDropdown = false;
    this.messageText.nativeElement.value =
      this.messageText.nativeElement.value + user.slice(1);
    if (id) {
      this.addUserTag(id);
    }
  }

  /**
   * Add user to input and hide Dropdown
   */
  addUserTag(id: string) {
    const newTag: { read: boolean; user: string } = {
      read: true,
      user: id,
    };

    this.tags.push(newTag);
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

  /**
   * Retrieves if the index is even
   * @param index - The index of the user.
   * @returns false or true if even or odd
   */
  isEven(index: number): boolean {
    return index % 2 === 0;
  }

    /**
   * Handles the outside click event for the search input component.
   * This method is called when a click event occurs outside the dropdown.
   */
    handleOutsideClick() {      
      this.hideChannelDropdown();      
      this.hideUserDropdown();
    }
}
