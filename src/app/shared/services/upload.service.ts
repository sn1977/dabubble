import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import {
  getDownloadURL,
  getMetadata,
  getStorage,
  ref,
  updateMetadata,
  uploadBytes,
} from '@angular/fire/storage';
import { Upload } from '../../../models/upload.class';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private firebase: FirebaseService) {}

  uploadCharacter(file: any, filename: string) {
    const storage = getStorage();
    const storageRef = ref(storage, `character/${filename}`);

    uploadBytes(storageRef, file)
      .then(() => {
        console.log('Uploaded a file!', filename);
        this.updateMeta(filename);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });      
  }

  updateMeta(filename: string){
    const storage = getStorage();
    const storageRef = ref(storage, `character/${filename}`);
    getMetadata(storageRef)
    .then((metadata: any) => {
      this.finalize(filename, metadata);
      // console.log('Metadata: ', filename, metadata);
      
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
  }

  finalize(filename: any, metadata: any){
    const storage = getStorage();
    const storageRef = ref(storage, `character/${filename}`);
    
    const newMetadata = {      
      contentType: 'image/jpeg'
    };

    updateMetadata(storageRef, newMetadata)
    .then(() => {})
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
  }
    

  downloadCharacter(file: any): Observable<void> {
    const storage = getStorage();
    const promise = getDownloadURL(ref(storage, `character/${file.name}`))
      .then((url) => {
        // const img = document.getElementById('myimg');
        // img.setAttribute('src', url);
        console.log('hallo', url);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
    return from(promise);
  }
}
