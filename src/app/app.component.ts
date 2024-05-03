import {Component, OnInit, inject, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LogInComponent } from './main-content/auth/log-in/log-in.component';
import {HeaderMobileComponent} from './shared/components/header-mobile/header-mobile.component';
import {MainContentComponent} from './main-content/main-content.component';
import { AuthService } from './shared/services/auth.service';
import { FirebaseService } from './shared/services/firebase.service';
import { DesktopHeadlineComponent } from "./shared/components/desktop-headline/desktop-headline.component";
import { DesktopContentComponent } from "./shared/components/desktop-content/desktop-content.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        RouterOutlet,
        LogInComponent,
        HeaderMobileComponent,
        MainContentComponent,
        DesktopHeadlineComponent,
        DesktopContentComponent
    ]
})
export class AppComponent implements OnInit{

  title = 'dabubble';
  authService = inject(AuthService);
  firestore = inject(FirebaseService);
  isMobileLandscapeOrientation: boolean = false;  
  isDesktop: boolean = false;  

 
  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if(user){
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!,
        });
      } else {
        this.authService.currentUserSig.set(null);
      }
    })
    this.isMobileLandscapeOrientation = this.checkIsMobileOrientation();
    this.isDesktop = this.checkIsDesktop();

  }


  /**
   * Check Orientation
   * @returns boolean
   */
  checkIsMobileOrientation(){
    if (
      window.matchMedia('(orientation: landscape)').matches &&
      window.matchMedia('(min-width: 320px)').matches &&
      window.matchMedia('(max-width: 939px)').matches &&
      window.innerWidth > window.innerHeight
    ) {      
      return true;
    } else {      
      return false;
    }
  }

  checkIsDesktop(){
    if (      
      window.matchMedia('(min-width: 993px)').matches
    ) {      
      return true;
    } else {      
      return false;
    }
  }
}
