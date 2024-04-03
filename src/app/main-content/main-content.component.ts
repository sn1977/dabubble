import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase.service';
import { User } from '../../models/user.class';
import { log } from 'console';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent implements OnInit{
  user = new User();
  userList: any = [];
  channelList: any = [];

  constructor(private firebase: FirebaseService){}
  
  getUsers(): User[]{
    return this.firebase.userList;
  }

  // getChannels(): Channel[]{
  //   return this.firebase.channelList;
  // }

  ngOnInit(): void {    
    this.firebase.userList;
   // this.firebase.channelList;
  }

}
