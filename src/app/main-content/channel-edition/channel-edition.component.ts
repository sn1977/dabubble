import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../shared/services/firebase.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { SearchUserComponent } from '../../shared/components/search-user/search-user.component';

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
  firestore = inject(FirebaseService);
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
      '.overlay[style="display: block;"]'
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

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      this.getItemValues('channels', this.itemID);
    });
  }

  

  getItemValues(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.channel = new Channel(this.firestore.channel);
      console.log('hello', this.channel);
      this.getItemValuesTwo('users', this.channel.creator)
    });
    setTimeout(() => {
      this.setOldChannelValues();
    }, 1000)
  }

  getItemValuesTwo(collection: string, itemID: string) {
    this.firestore.getSingleItemData(collection, itemID, () => {
      this.user = new User(this.firestore.user);
      console.log('hellotwo', this.user);
    });
  }

  setOldChannelValues(){
    this.channelData = {
      creator: this.channel.creator,
      description: this.channel.description,
      member: this.channel.member,
      name: this.channel.name,
      count: this.channel.count,
    };
    
  }
  openChannel(event: MouseEvent, path: string) {
    const docRefId = (event.currentTarget as HTMLElement).id;
    console.log('Öffne Collection ' + path + ' mit ID: ' + docRefId);
    this.router.navigate(['/' + path + '/' + docRefId]);
  }
}
