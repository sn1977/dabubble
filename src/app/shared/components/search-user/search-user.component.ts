import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../../models/user.class';
import { Channel } from '../../../../models/channel.class';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-search-user',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink, CommonModule],
  templateUrl: './search-user.component.html',
  styleUrl: './search-user.component.scss'
})
export class SearchUserComponent {

  selectedUsers: User[] = [];
  userNames: string = '';
  selectedUser: any = [];
  users: User[] = [];
  filteredUsers: User[] = [];
  selected: boolean = false;
  showDropdown: boolean = false;
  overlayVisible: boolean = false;
  showInputField: boolean = false;
  showAddMember: boolean = false;
  showGeneralInputField: boolean = false
  isAddAllMembersChecked: boolean = false;
  isAddSpecificMembersChecked: boolean = false;
  firestore = inject(FirestoreService);
  router = inject(Router);
  authService = inject(AuthService);
  itemID: any = '';
  searchQuery: string = '';

  activeUser: any ='';
  channel: Channel = new Channel();

  channelData = {
    creator: this.channel.creator,
    description: this.channel.description,
    member: this.channel.member,
    name: this.channel.name,
    count: '',
    newMessage: this.channel.newMessage,
  };


  onSubmit() {
    
    this.selectedUsers = this.filterUsers();
    
    //const memberNames = this.selectedUsers.map(user => user.displayName);

    // if(this.channelData.name === ''){
    //   this.channelData.name = this.channel.name;
    // }
    
    // if(this.channelData.description === ''){
    //   this.channelData.description = this.channel.description;
    // }

    // if (this.channelData.member.length === 0 && Array.isArray(this.channel.member)) {
    //   this.channelData.member = this.channel.member;
    // }

    // if(this.isAddAllMembersChecked){
    //   this.channelData.member = this.getUserIds(this.firestore.getUsers());
    // }

    // console.log(this.channelData.member);
    // console.log(this.selectedUsers);
    

    // const channel = new Channel({
    //   creator: this.authService.activeUserId,
    //   description: this.channelData.description,
    //   member: this.selectedUsers,
    //   name: this.channelData.name,
    //   newMessage: this.channel.newMessage,
    // });
    // this.firestore.updateChannel(this.itemID, channel);
  }

// onSubmit(){

//   console.log(this.selectedUsers);
//   console.log(this.channel.member);

//   let userIds;

//       if(this.isAddAllMembersChecked){
//         userIds = this.getUserIds(this.firestore.getUsers());
//       }
//       else{
        
//         //   if (this.channelData.member.length === 0 && Array.isArray(this.channel.member)) {
//   //     this.channelData.member = this.channel.member;
//   //   }

//   //   const channel = new Channel({
//   //     creator: this.authService.activeUserId,
//   //     description: this.channelData.description,
//   //     member: this.selectedUsers,
//   //     name: this.channelData.name,
//   //     newMessage: this.channel.newMessage,
//   //   });
//   //   this.firestore.updateChannel(this.itemID, channel);

//       }

//       const channel = new Channel({
//         creator: this.authService.activeUserId,
//         description: this.channelData.description,
//         member: userIds,
//         name: this.channelData.name,
//         count: this.channelData.count,
//         newMessage: this.channelData.newMessage,
//       });
      
//       //this.firestore.addChannel(channel);
//       this.firestore.updateChannel(this.itemID, channel);

//       console.log(userIds);
//       console.log(this.isAddAllMembersChecked);
//       console.log(this.isAddSpecificMembersChecked);
      
//       this.closeOverlay('overlay');
// }


  constructor (private route: ActivatedRoute) {}
  
  getUserIds(usersArray: any[]) {
    return usersArray.map((user) => user.id);
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
      this.selectedUsers = this.filterUsers();
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
      count: '',
      newMessage: this.channel.newMessage,
    };    
  }

  addmember(event: MouseEvent, user: User) {
    const index = this.selectedUsers.findIndex(
      (selectedUser) => selectedUser.id === user.id
    );

    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
    // this.updateFormattedUserNames();
    console.log(this.selectedUsers);    
  }

  // updateFormattedUserNames() {
  //   this.userNames = this.selectedUsers
  //     .map(user => user.displayName)
  //     .join(', ');
  // }

  removeUser(user: User) {
    // this.selectedUsers = this.filterUsers();
    const index = this.selectedUsers.findIndex(
      (selectedUser) => selectedUser.id === user.id
    );
    if (index !== -1) {
      this.selectedUsers.splice(index, 1);
      //this.updateFormattedUserNames();
    }
  }

  onSearchInputChange(value: string) {
    this.searchQuery = value;
  }

  matchesSearch(user: any): boolean {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return true;
    }
    return user.displayName
      .toLowerCase()
      .includes(this.searchQuery.toLowerCase());
  }

  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }

  toggleInputField(inputId: string) {
    if (inputId === 'addSpecificMembers') {
      this.showInputField = !this.showInputField;
      this.showAddMember = false;
    } else if (inputId === 'searchPeople') {
      if (this.showInputField) {
        this.showAddMember = !this.showAddMember;
      } else {
        this.showInputField = true;
        this.showAddMember = true;
      }
    }
  }
  
  xtoggleCheckbox(checkboxId: string): void {
    if (checkboxId === 'addAllMembers') {      
      if (this.isAddAllMembersChecked) {        
        this.isAddAllMembersChecked = false;
        this.showGeneralInputField = false; // Verstecke das allgemeine Eingabefeld
      } else {
        // Checkbox wird jetzt ausgewählt
        this.isAddAllMembersChecked = true;
        this.isAddSpecificMembersChecked = false; // Setze andere Checkbox zurück
        this.showInputField = false; // Verstecke das spezifische Eingabefeld
        this.showGeneralInputField = true; // Öffne das allgemeine Eingabefeld        
        // Aktualisiere die angezeigten Benutzernamen
        //this.updateFormattedUserNames();
      }
    } else if (checkboxId === 'addSpecificMembers') {
      // Checkbox 'Bestimmte Leute hinzufügen' wurde ausgewählt
      this.isAddAllMembersChecked = false; // Setze andere Checkbox zurück
      this.isAddSpecificMembersChecked = true;
      this.showGeneralInputField = false; // Verstecke das allgemeine Eingabefeld
    }
  }

  toggleCheckbox(checkboxId: string): void {
    if (checkboxId === 'addAllMembers') {
      this.isAddAllMembersChecked = true;
      this.isAddSpecificMembersChecked = false;
      this.showInputField = false;

    } else if (checkboxId === 'addSpecificMembers') {
      this.selectedUsers = [];
      this.isAddAllMembersChecked = false;
      this.isAddSpecificMembersChecked = true;
    }
  }
  
  filterUsers() {
    return this.filterUsersById(this.firestore.getUsers(), this.channel.member);
  }
  
  filterUsersById(usersArray: any[], idsArray: string | any[]) {
    return usersArray.filter((user) => idsArray.includes(user.id));
  }
  
  getInputValue(event: any): string {
    return event && event.target && event.target.value;
  }

  closeOverlay(overlayId: string): void {
    const overlay = document.getElementById(overlayId) as HTMLElement;
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
}



