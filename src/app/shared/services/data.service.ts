import { Injectable } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { User } from '../../../models/user.class';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  allChannels: Channel[] = [];
  channelMatches: any;
  allUsers: User[] = [];
  userMatches: any;
  noUserFound: boolean = false;
  noChannelFound: boolean = false;

  constructor() { }

  async searchWorkspace(query: string) {
    if (query == '') {      
      this.channelMatches = this.allChannels;
      this.userMatches = this.allUsers;
      return;
    }    
    
    query = query.toLowerCase();   

    this.channelMatches = this.allChannels
      .filter((channel) => channel.name.toLowerCase().includes(query))
      .map((channel) => ({ ...channel, type: 'channel' }));

    this.userMatches = this.allUsers
      .filter(
        (user) =>
          user.displayName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
      .map((user) => ({ ...user, type: 'user' }));
  }
}
