import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-time-seperator',
  standalone: true,
  imports: [],
  templateUrl: './time-seperator.component.html',
  styleUrl: './time-seperator.component.scss'
})
export class TimeSeperatorComponent {
  
  @Input() seperatorDate: string = 'Heute';

}
