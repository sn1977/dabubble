import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../shared/services/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { AuthService } from '../../shared/services/auth.service';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink, CommonModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent  {
onSubmit() {
  this.channelData.member = this.selectedUser
console.log(this.channelData);
  /*this.firestore.addChannel(this.channelData)*/
}
  
  filteredUsers: User[] = [];
  showDropdown: boolean = false;
  firestore = inject(FirebaseService);
  router = inject(Router);
  authService = inject(AuthService);
  users: User[] = [];
  channel: Channel = new Channel;

  channelData = {
    creator: this.authService.activeUserId, 
    description: '', 
    member: [],
    name: '',
  };

  selectedUser:any = [];

  addmember(event: MouseEvent) {
    const docRefId = (event.currentTarget as HTMLElement).id;
    
    // Überprüfe, ob die docRefId bereits in this.selectedUser vorhanden ist
    const index = this.selectedUser.indexOf(docRefId);
    if (index === -1) {
        // Wenn nicht, füge sie hinzu
        this.selectedUser.push(docRefId);
        console.log(this.selectedUser);
    } else {
        // Wenn vorhanden, entferne sie aus dem Array
        this.selectedUser.splice(index, 1);
        console.log('Diese docRefId wurde entfernt:', docRefId);
        console.log(this.selectedUser);
    }
}





  overlayVisible: boolean = false;
  showInputField: boolean = false;

   /*constructor() {
    this.loadUsers();

    this.channel.creator = "Yannick1";
    this.channel.description = "Yannick2";
    this.channel.member = ["Yannick3", "Stefan"];
    this.channel.name = "Yannick4";

    console.log(this.channel);
    this.firestore.addChannel(this.channel);
  }*/

  
  loadUsers() {

    
    let users = this.firestore.getUsers();
    for (const user of users) {
      console.log('ID:', user.id);
      console.log('Avatar:', user.avatar);
      console.log('Email:', user.email);
      console.log('Display Name:', user.displayName);
      console.log('Is Online:', user.isOnline);
      console.log('Provider:', user.provider);
      console.log('-----------------------------------');
    }

    
  }


  filterUsers(event: any): void {
    
    const searchText: string = event.target.value;
    if (!searchText) {
      this.filteredUsers = [];
      return;
    }
    this.filteredUsers = this.users.filter(user =>
      user.displayName.toLowerCase().includes(searchText.toLowerCase())
    );
  }


  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }

  toggleInputField(event: any) {
    this.showInputField =
      event.target.id === 'addSpecificMembers' && event.target.checked;
  }

  getInputValue(event: any): string {
    return event && event.target && event.target.value;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  
}
