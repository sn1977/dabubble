import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Channel} from '../../../models/channel.class';
import {User} from '../../../models/user.class';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent {
  textData = { text: '' };
  inputHasValue = false;

  filteredResults: any[] = [];
  allChannels: Channel[] = [];
  allUsers: User[] = [];
  noUserFound: boolean = false;
  noChannelFound: boolean = false;

  @Output() search = new EventEmitter<string>();

  // searchWorkspace(query: string) {
  //   this.inputHasValue = !!query;
  //   this.search.emit(query);
  // }

  searchWorkspace(query: string) {
    // console.log('Suchanfrage: ', query);
    if (!query) {
      this.filteredResults = [];
      let erg = 0;
      this.hideUserElements(query, erg);
      this.hideChannelElements(query, erg);
      return;
    }
    query = query.toLowerCase();

    let channelMatches = this.allChannels
      .filter((channel) => channel.name.toLowerCase().includes(query))
      .map((channel) => ({ ...channel, type: 'channel' }));

    let userMatches = this.allUsers
      .filter(
        (user) =>
          user.displayName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
      .map((user) => ({ ...user, type: 'user' }));

    this.filteredResults = [...channelMatches, ...userMatches];

    let resultUser = 0;
    let resultChannel = 0;
    this.hideUserElements(query, resultUser);
    this.hideChannelElements(query, resultChannel);
  }

  async hideUserElements(search: string, erg: number) {
    this.noUserFound = false;

    let filteredUsers = Array.from(
      document.querySelectorAll('.user-name')
    ) as HTMLElement[];

    for (let i = 0; i < filteredUsers.length; i++) {
      let element = filteredUsers[i];
      let innerText = element.innerText;

      if (innerText.toLowerCase().includes(search)) {
        element.classList.remove('d-none');
        erg++;
      } else {
        filteredUsers[i].classList.add('d-none');
      }
    }

    if (erg == 0) {
      this.noUserFound = true;
    }
  }

  async hideChannelElements(search: string, erg: number) {
    this.noChannelFound = false;

    let filteredChannels = Array.from(
      document.querySelectorAll('.channel-name')
    ) as HTMLElement[];

    for (let i = 0; i < filteredChannels.length; i++) {
      let element = filteredChannels[i];
      let innerText = element.innerText;

      if (innerText.toLowerCase().includes(search)) {
        element.classList.remove('d-none');
        erg++;
      } else {
        filteredChannels[i].classList.add('d-none');
      }
    }

    if (erg == 0) {
      this.noChannelFound = true;
    }
  }

}
