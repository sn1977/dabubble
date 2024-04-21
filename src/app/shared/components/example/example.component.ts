import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../../../models/user.class';
import { ActivatedRoute } from '@angular/router';
import { Channel } from '../../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent implements OnInit {
  itemID: any = '';
  user: User = new User();
  channel: Channel = new Channel();
  firestore = inject(FirebaseService);
  firebaseAuth = inject(Auth);
  activeUser: any;
  
  constructor(private route: ActivatedRoute,private authService: AuthService,) {}  

  ngOnInit() {


    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');

      // Es kann immer nur eins aktiv sein
      // Beispielhafter Aufruf (wenn in URL angegeben)
      // http://localhost:4200/example/iQmmKETxbihQVI6EtKZ8
      // this.getActiveUser(this.itemID);

      // Beispielhafter Aufruf (hard gecoded)
      // this.getActiveUser('9MacQRd4i2TX9J42mVLBGgVCsPp1');

      if (this.itemID) {
        // test user
        //this.getItemValues('users', this.itemID);
        // test channel
        this.getItemValues('channels', this.itemID);
      } else {
        // test user
        //this.getItemValues('users', '9MacQRd4i2TX9J42mVLBGgVCsPp1');
        // test channel
        this.getItemValues('channels', 'vXRTxUTQxznUmQyIqqZK');
      }
    });
  }


// channel-messages
// 9KJYLfxx07Wn5rbEupdA/channelmessages/cMWBoncDqfH93llCG5xs
// testFunction(){
//   console.log('testFunction fired');
//   this.firestore.getAllChannelMessages();
// }



  getItemValues(collection: string, itemID: string) {    
    this.firestore.getSingleItemData(collection, itemID, () => {
      
      if(collection === 'users'){
        this.user = new User(this.firestore.user);
      }
      if(collection === 'channels'){        
        this.channel = new Channel(this.firestore.channel);
      }
    });
  }
}
