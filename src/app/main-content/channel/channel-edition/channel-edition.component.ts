import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Channel } from '../../../../models/channel.class';
import { User } from '../../../../models/user.class';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { SearchUserComponent } from '../../../shared/components/search-user/search-user.component';

@Component({
  selector: 'app-channel-edition',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, SearchUserComponent],
  templateUrl: './channel-edition.component.html',
  styleUrl: './channel-edition.component.scss',
})
export class ChannelEditionComponent implements OnInit {
  selectedUser: any = [];
  router = inject(Router);
  itemID: any = '';
  user: User = new User();
  firestore = inject(FirestoreService);
  authService = inject(AuthService);
  channel: Channel = new Channel();
  isEditingChannelName: boolean = false;
  isEditingDescription: boolean = false;


  channelData = {
    creator: this.channel.creator,
    description: this.channel.description,
    member: this.channel.member,
    name: this.channel.name,
    count: this.channel.count,
    newMessage: this.channel.newMessage,
    // allMembers: this.channel.allMembers
  };

  constructor( private route: ActivatedRoute, ) {
  }

 

  onSubmit(toggle: string) {
   
    if(this.channelData.name === ''){
      this.channelData.name = this.channel.name;
    }
    
    if(this.channelData.description === ''){
      this.channelData.description = this.channel.description;
    }

    if (this.channelData.member.length === 0 && Array.isArray(this.channel.member)) {
      this.channelData.member = this.channel.member;
    }

    const channel = new Channel({
      creator: this.channel.creator,
      description: this.channelData.description,
      member: this.channel.member,
      name: this.channelData.name,
      count: this.channel.count,
      newMessage: this.channel.newMessage,
      // allMembers: this.channel.allMembers
    });

    this.toggleEdit(toggle);    
    this.firestore.updateChannel(this.itemID, channel);
  }

  toggleEdit(field: string) {
    if (field === 'channelName') {
      this.isEditingChannelName = !this.isEditingChannelName;
    } else if (field === 'channelDescription') {
      this.isEditingDescription = !this.isEditingDescription;
    }
  }

  toggleOverlay(overlayId: string): void {
    const currentOverlay = document.querySelector(
      '.overlay1[style="display: block;"]'
    ) as HTMLElement;
    const newOverlay = document.getElementById(overlayId);

    if (currentOverlay && currentOverlay.id !== overlayId) {
      // Schließe das aktuelle Overlay, wenn ein anderes Overlay geöffnet ist
      currentOverlay.style.display = 'none';
    }

    if (newOverlay) {
      newOverlay.style.display =
        newOverlay.style.display === 'none' ? 'block' : 'none';
    }
  }

  closeOverlay(overlayId: string): void {
    const overlay = document.getElementById(overlayId) as HTMLElement;
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async (paramMap) => {      
      this.itemID = paramMap.get('id');
      this.getItemValues('channels', this.itemID);
      await this.waitForUserData();      
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

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
      this.user = new User(this.firestore.user);
    });
    setTimeout(() => {
      this.setOldChannelValues();
    }, 1000)
  }

  setOldChannelValues(){
    this.channelData = {
      creator: this.channel.creator,
      description: this.channel.description,
      member: this.channel.member,
      name: this.channel.name,
      count: this.channel.count,
      newMessage: this.channel.newMessage,
      // allMembers: this.channel.allMembers
    };
    
  }
  openChannel(event: MouseEvent, path: string) {
    const docRefId = (event.currentTarget as HTMLElement).id;
    //console.log('Öffne Collection ' + path + ' mit ID: ' + docRefId);
    this.router.navigate(['/' + path + '/' + docRefId]);
    //this.getActivUserId();
  }

  getActivUserId() {
    let id = this.authService.activeUserAccount.uid;
    console.log(id); // Stelle sicher, dass id definiert ist, bevor du darauf zugreifst

    this.removeMemberById(id);
  
  }

  removeMemberById(id: string) {
    const memberArray = this.channel.member || [];
    const index = memberArray.findIndex(member => member.id === id);
    

    if (index !== -1) {
      memberArray.splice(index, 1);
      console.log('Mitglied mit ID', id, 'wurde aus dem Array entfernt.');
      this.onSubmit('update');
    } else {
      //console.log('Mitglied mit ID', id, 'nicht im Array gefunden.');
    }
  }
  
}
