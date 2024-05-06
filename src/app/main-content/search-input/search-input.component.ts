import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

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

  @Output() search = new EventEmitter<string>();

  searchWorkspace(query: string) {
    this.inputHasValue = !!query;
    this.search.emit(query);
  }

}
