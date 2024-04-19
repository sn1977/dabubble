import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  getStorage,
  ref,
  updateMetadata,
  uploadBytes,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private firebase: FirebaseService) {}

  uploadFile(file: File, filedate: number, folder: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const storage = getStorage();
      const metadata = {
        contentType: file.type,
      };

      const newFileName = filedate + '_' + file.name;
      const storageRef = ref(storage, folder + '/' + newFileName);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log('Upload is ' + progress + '% done');
          // switch (snapshot.state) {
          //   case 'paused':
          //     console.log('Upload is paused');
          //     break;
          //   case 'running':
          //     console.log('Upload is running');
          //     break;
          // }
        },
        (error) => {
          switch (error.code) {
            case 'storage/unauthorized':
              reject(error);
              break;
            case 'storage/canceled':
              reject(error);
              break;
            case 'storage/unknown':
              reject(error);
              break;
            default:
              reject(error);
              break;
          }
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL);
            })
            .catch((error) => {
              reject(error);
            });
        }
      );
    });
  }   
}
