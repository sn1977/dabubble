import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase.service';
import { User } from '../../models/user.class';
import { log } from 'console';
// import {HeaderMobileComponent} from '../shared/components/header-mobile/header-mobile.component';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  MatAccordion, MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelTitle
} from '@angular/material/expansion';


@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [
    // HeaderMobileComponent,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatExpansionModule
  ],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent implements OnInit{
  user = new User();
  userList: any = [];
  channelList: any = [];
  panelOpenState = false;

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
