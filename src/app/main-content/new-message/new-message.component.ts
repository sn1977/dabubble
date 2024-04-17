import { Component, inject } from '@angular/core';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { FirebaseService } from '../../shared/services/firebase.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {


  constructor(private _bottomSheet: MatBottomSheet){
    
  }
  firebaseAuth = inject(Auth);
  authService = inject(AuthService);
  firestore = inject(FirebaseService);
  router = inject(Router);
  user: User = new User();

  async ngOnInit(): Promise<void> {
    await this.waitForUserData();
    this.test();

  }

  async waitForUserData(): Promise<void> {
    while (!this.authService.activeUserAccount) {
      await this.delay(100); // Wartezeit in Millisekunden, bevor erneut überprüft wird
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  test() {
    let id = this.authService.activeUserAccount.uid;
    console.log(id); // Stelle sicher, dass id definiert ist, bevor du darauf zugreifst
    this.getItemValuesProfile('users', id);
  }
  
  toggleOverlay(overlayId: string): void {
    const currentOverlay = document.querySelector('.overlay[style="display: block;"]') as HTMLElement;
    const newOverlay = document.getElementById(overlayId);
  
    if (currentOverlay && currentOverlay.id !== overlayId) {
      // Schließe das aktuelle Overlay, wenn ein anderes Overlay geöffnet ist
      currentOverlay.style.display = "none";
    }
  
    if (newOverlay) {
      newOverlay.style.display = newOverlay.style.display === "none" ? "block" : "none";
    }
  }
  
  closeOverlay(overlayId: string): void {
    const overlay = document.getElementById(overlayId) as HTMLElement;
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetComponent);
  }

  getItemValuesProfile(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
      console.log('Avatar: ' + this.user.avatar);
    });
  }

}
