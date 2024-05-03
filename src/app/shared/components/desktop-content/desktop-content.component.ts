import { Component } from '@angular/core';
import { MainContentComponent } from "../../../main-content/main-content.component";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-desktop-content',
    standalone: true,
    templateUrl: './desktop-content.component.html',
    styleUrl: './desktop-content.component.scss',
    imports: [MainContentComponent, CommonModule]
})
export class DesktopContentComponent {

}
