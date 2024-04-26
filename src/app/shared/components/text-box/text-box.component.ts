import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-box',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss'
})
export class TextBoxComponent {

  @Input() textBoxData: any;

  add_hovered: boolean = false;
  smile_hovered: boolean = false;
  email_hovered: boolean = false;
  send_hovered: boolean = false;

  deleteHovered() {
    this.add_hovered = false;
    this.smile_hovered = false;
    this.email_hovered = false;
    this.send_hovered = false;
  }

  onSubmit(){
    console.log('klappt');
  }

}
