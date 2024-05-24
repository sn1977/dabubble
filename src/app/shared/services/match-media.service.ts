import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MatchMediaService {

  showThread: boolean = false;  
  channelId: string = '';
  subID: string = '';
  channelName: string = '';
  
  constructor() { }

  
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

  /**
   * Desktop or mobile
   * @returns boolean
   */
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
