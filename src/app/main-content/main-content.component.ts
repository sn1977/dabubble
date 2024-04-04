import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../shared/services/firebase.service';
import { User } from '../../models/user.class';
import { log } from 'console';
import {HeaderMobileComponent} from '../shared/components/header-mobile/header-mobile.component';
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
    HeaderMobileComponent,
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
  panelsState = [true, true]; // Beide Panels anfangs geöffnet

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

  onPanelOpened(index: number) {
    this.panelsState[index] = true; // Aktualisiere den Zustand des Panels
  }

  onPanelClosed(index: number) {
    this.panelsState[index] = false; // Aktualisiere den Zustand des Panels
  }

  getArrowImagePath(index: number): string {
    // Bestimme den Bildpfad basierend auf dem Zustand des Panels
    return this.panelsState[index] ? 'assets/img/icon/arrow_drop_down.png' : 'assets/img/icon/arrow_drop_down_color.png';
  }


}
