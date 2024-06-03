import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, ElementRef, Input, ViewChild, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ChannelMessage} from '../../../../models/channel-message.class';
import {AuthService} from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import {UploadService} from '../../services/upload.service';
import {serverTimestamp} from '@angular/fire/firestore';
import {EmojiEvent} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {PickerComponent} from '@ctrl/ngx-emoji-mart';
import {MatDialog} from '@angular/material/dialog';
import {EmojiPickerComponent} from '../emoji-picker/emoji-picker.component';

@Component({
  selector: 'app-text-box',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss',
})
export class TextBoxComponent implements AfterViewInit{
  authService = inject(AuthService);
  firestore = inject(FirestoreService);
  reactions = [];
  selectedFiles: FileList | undefined;
  filedate: number | undefined;
  errorMessage: string | null = null;
  openEmojiPicker: boolean = false;

  @Input() textBoxData: any;
  @ViewChild('messageText') messageText!: ElementRef<HTMLTextAreaElement>;
  private initialHeight: string = '';

  add_hovered: boolean = false;
  smile_hovered: boolean = false;
  email_hovered: boolean = false;
  send_hovered: boolean = false;

  constructor(
    private uploadService: UploadService,
    private dialog: MatDialog
  ) {}

  addEmoji(event: EmojiEvent) {
    const {emoji} = event;
    this.textBoxData.messageText += emoji.native;
  }

  deleteHovered() {
    this.add_hovered = false;
    this.smile_hovered = false;
    this.email_hovered = false;
    this.send_hovered = false;
  }

  onSubmit() {
    if (this.textBoxData.messageText != '') {
      this.textBoxData.subcollection;
      
      const message = new ChannelMessage({
        creator: this.authService.activeUserId,
        text: this.textBoxData.messageText,
        channelId: this.textBoxData.channelId,
        createdAt: serverTimestamp(),
        reactions: (this.textBoxData.reactions = this.reactions),
        collection: this.textBoxData.collection,
        subcollection: this.textBoxData.subcollection,
        attachment: [`${this.textBoxData.inputField}`],
        threads: [],
      });
      
      this.firestore.addChannelMessage(
         message,
         `${this.textBoxData.collection}/${message.channelId}/${this.textBoxData.subcollection}`
      );

      this.textBoxData.inputField = '';
      this.selectedFiles = undefined;
      this.textBoxData.messageText = '';
      this.resetTextareaHeight();      
    }
  }

  submitForm(event: any) {
    event.preventDefault();
    if (this.textBoxData.messageText.trim() !== '') {
      this.onSubmit();
    }
  }

  detectFile(event: any) {
    this.selectedFiles = event.target.files;
    this.uploadSingleFile();
  }

  uploadSingleFile() {
    if (this.selectedFiles) {
      let file = this.selectedFiles.item(0);
      if (file) {
        this.filedate = new Date().getTime();
        this.uploadService
          .uploadFile(file, this.filedate, 'attachments')
          .then((url: string) => {
            this.textBoxData.inputField = url;
          })
          .catch((error) => {
            this.errorMessage = error.code;
          });
      }
    }
  }

  openEmojiPickerDialog(): void {
    const dialogRef = this.dialog.open(EmojiPickerComponent, {
      width: '400px',
      height: '300px',
    });


    dialogRef.componentInstance.emojiSelect.subscribe((event: string) => {
      console.log('Empfangenes Emoji:', event);
      this.addEmoji({emoji: {native: event}} as EmojiEvent); // Konvertieren Sie den empfangenen String in ein EmojiEvent Objekt
      dialogRef.close();
    });
  }

  ngAfterViewInit() {
    const textarea = this.messageText.nativeElement;
    this.initialHeight = textarea.style.height || 'auto';
    this.adjustTextareaHeight(textarea);
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement) {    
    textarea.style.height = 'auto';    
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.focus();
  }

  resetTextareaHeight(){
    const textarea = this.messageText.nativeElement;
    textarea.style.height = this.initialHeight;
  }

}