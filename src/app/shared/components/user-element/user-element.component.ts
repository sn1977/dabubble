import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-element',
  standalone: true,
  imports: [],
  templateUrl: './user-element.component.html',
  styleUrl: './user-element.component.scss',
})
export class UserElementComponent {
  @Input() user = {
    id: '',
    isOnline: false,
    name: '',
    avatar: '',
  };
}
