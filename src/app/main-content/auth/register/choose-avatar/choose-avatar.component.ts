import { HttpClient } from '@angular/common/http';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Upload } from '../../../../../models/upload.class';
import { UploadService } from '../../../../shared/services/upload.service';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [
    MatCardModule,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss',
})
export class ChooseAvatarComponent {
  @Input() contactData: any;

  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);

  errorMessage: string | null = null;
  templateIndex: number = 0;
  currentAvatar: any = './assets/img/characters/profile.svg';
  chooseAvatar: boolean | undefined;
  confirm: boolean = false;

  selectedFiles: FileList | undefined;
  currentUpload: Upload | undefined;

  constructor(private uploadService: UploadService){ }

  onSubmit(): void {

    if (this.contactData.photoURL) {
      this.authService
        .register(
          this.contactData.email,
          this.contactData.name,
          this.contactData.password,
          this.contactData.photoURL
        )
        .subscribe({
          complete: () => {            
            setTimeout(() => {
              this.authService.logout();
            }, 3500);
          },
          next: () => {
            this.confirm = true;
          },
          error: (err) => {
            this.errorMessage = err.code;
          },
        });
    } else {
      this.chooseAvatar = true;
    }    
  }

  setAvatar(event: MouseEvent) {
    const imgElement = event.target as HTMLImageElement;
    
    
    //this.currentAvatar = imgElement.src;
    this.currentAvatar = 'https://firebasestorage.googleapis.com/v0/b/da-bubble-ca3ba.appspot.com/o/character%2Fstefan.jpg';
    //this.currentAvatar.setAttribute('src', imgElement);

    this.contactData.photoURL = this.currentAvatar;
    this.chooseAvatar = false;
  }

  detectFiles(event: any){
    this.selectedFiles = event.target.files;
    this.uploadSingle();
  }

  uploadSingle(){
    if(this.selectedFiles){
      let file = this.selectedFiles.item(0);
      if(file){
        this.currentUpload = new Upload(file);        
        this.uploadService.uploadCharacter(this.currentUpload, file.name);
        this.getInfo(file.name);
      }      
    }
  }

  getInfo(file: string){    
  //  this.uploadService.downloadCharacter(file); 

  //console.log(this.uploadService.downloadCharacter(file));
  
  
  

//    this.currentAvatar = 

    // klappt console.log('stefan', file);
  }
}