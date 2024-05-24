import {Component, EventEmitter, Input, Output, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Channel} from '../../../models/channel.class';
import {User} from '../../../models/user.class';
import { DataService } from '../../shared/services/data.service';

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

  dataService = inject(DataService);
  @Output() search = new EventEmitter<string>(); 
}
