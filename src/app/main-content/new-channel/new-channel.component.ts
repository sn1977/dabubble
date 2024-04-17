import {Component, inject, OnInit} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Channel } from '../../../models/channel.class';
import { FirebaseService } from '../../shared/services/firebase.service';
import {ActivatedRoute} from '@angular/router';
import { User } from '../../../models/user.class';
import { NavigationService } from '../../shared/services/navigation.service';
import {NgForOf, NgIf} from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-new-channel',
  standalone: true,
  imports: [RouterLink, BottomSheetComponent,  NgIf],
  templateUrl: './new-channel.component.html',
  styleUrl: './new-channel.component.scss'
})
export class NewChannelComponent implements OnInit  {
  firestore = inject(FirebaseService);
  router = inject(Router);
  itemID: any = '';
  user: User = new User();
  channel: Channel = new Channel();
  channelList: any = [];
  firebaseAuth = inject(Auth);
  authService = inject(AuthService);

  constructor(
    private _bottomSheet: MatBottomSheet, 
    private route: ActivatedRoute,
    public navigationService: NavigationService){
    
  }

  async ngOnInit(): Promise<void> {
    await this.waitForUserData();
    this.test();

    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('channels', this.itemID);
    });
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

    
      getItemValues(collection: string, itemID: string) {
        this.firestore.getSingleItemData(collection, itemID, () => {
          this.channel = new Channel(this.firestore.channel);
        });
      }

      openChannel (event: MouseEvent, path: string) {
        const docRefId = (event.currentTarget as HTMLElement).id;
        console.log('Öffne Collection ' + path + ' mit ID: ' + docRefId);
        this.router.navigate(['/' + path + '/' + docRefId]);
      }

      getItemValuesProfile(collection: string, itemID: string) {
        this.firestore.getSingleItemData(collection, itemID, () => {
          this.user = new User(this.firestore.user);
          console.log('Avatar: ' + this.user.avatar);
        });
      }
}

