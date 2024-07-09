import { Injectable } from '@angular/core';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor() {}

  /**
   * Set metadata for file
   * @returns content type.
   */
  createMetadata(file: File) {
    return {
      contentType: file.type,
    };
  }

  /**
   * Create file name
   * @returns file name.
   */
  createFileName(filedate: number, file: File) {
    return `${filedate}_${file.name}`;
  }

  /**
   * Set storage reference
   * @returns reference
   */
  createStorageRef(storage: any, folder: string, newFileName: string) {
    return ref(storage, `${folder}/${newFileName}`);
  }

  /**
   * Error handling
  * @returns error text depending on error.code
  */
  handleUploadError(error: any, reject: (reason?: any) => void) {
    switch (error.code) {
      case 'storage/unauthorized':
      case 'storage/canceled':
      case 'storage/unknown':
      default:
        reject(error);
        break;
    }
  }

  /**
   * retrieving download-url
   */
  getDownloadUrlAndResolve(
    uploadTask: any,
    resolve: (value: string | PromiseLike<string>) => void,
    reject: (reason?: any) => void
  ) {
    getDownloadURL(uploadTask.snapshot.ref)
      .then((downloadURL: string) => {
        resolve(downloadURL);
      })
      .catch((error: any) => {
        reject(error);
      });
  }

  /**
   * Upload file to storage bucket
   */
  uploadFile(file: File, filedate: number, folder: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const storage = getStorage();
      const metadata = this.createMetadata(file);
      const newFileName = this.createFileName(filedate, file);
      const storageRef = this.createStorageRef(storage, folder, newFileName);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => this.handleUploadError(error, reject),
        () => this.getDownloadUrlAndResolve(uploadTask, resolve, reject)
      );
    });
  }
}
