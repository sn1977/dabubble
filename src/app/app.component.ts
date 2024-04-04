import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LogInComponent } from './main-content/log-in/log-in.component';
import {HeaderMobileComponent} from './shared/components/header-mobile/header-mobile.component';
import {MainContentComponent} from './main-content/main-content.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LogInComponent,
    HeaderMobileComponent,
    MainContentComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dabubble';
  isOnline: boolean = true; // muss aus dem Service kommen
}
