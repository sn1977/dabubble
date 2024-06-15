import { Injectable, inject } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';
import { MatchMediaService } from './match-media.service';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  allChannels: Channel[] = [];
  channelMatches: any;
  allUsers: User[] = [];
  userMatches: any;
  noUserFound: boolean = false;
  noChannelFound: boolean = false;
  matchMedia = inject(MatchMediaService);
  firestore = inject(FirestoreService);

  constructor() {}

  async searchWorkspace(query: string) {
    if (query == '') {
      this.channelMatches = this.firestore.channelList;

      // console.log(this.authService.activeUserAccount.displayName;);
      
      
      const myName = 'Donal Duck';  // Dein eigener Name
      // Finde den Index des Eintrags mit deinem Namen
      const myIndex = this.firestore.userList.findIndex((user: { displayName: string | string[]; }) => user.displayName.includes(myName));
      if (myIndex > -1) {
        // Entferne den Eintrag mit deinem Namen aus der aktuellen Position
        const myUser = this.firestore.userList.splice(myIndex, 1)[0];
        // Füge den Eintrag mit deinem Namen an den Anfang der Liste
        this.firestore.userList.unshift(myUser);
      }
      
      this.userMatches = this.firestore.userList;
      return;
    }
    this.matchMedia.channelName = '';

    query = query.toLowerCase();

    this.channelMatches = this.allChannels
      .filter((channel) => channel.name.toLowerCase().includes(query))
      .map((channel) => ({ ...channel, type: 'channel' }));

    this.userMatches = this.allUsers
      .filter(
        (user) =>
          user.displayName!.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
      .map((user) => ({ ...user, type: 'user' }));
  }

  containsPartialChannelValue(searchValue: string) {
    if (this.channelMatches) {
      return this.channelMatches.some((item: { name: string | string[] }) =>
        item.name.includes(searchValue)
      );
    }
  }

  containsPartialUserValue(searchValue: string) {
    if (this.userMatches) {
      return this.userMatches.some((item: { displayName: string | string[] }) =>
        item.displayName.includes(searchValue)
      );
    }
  }
}
