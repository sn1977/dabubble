import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../../../models/user.class';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent implements OnInit {
  itemID: any = '';
  user: User = new User();
  firestore = inject(FirebaseService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      this.itemID = paramMap.get('id');
      
      // Es kann immer nur eins aktiv sein
      
      // Beispielhafter Aufruf (wenn in URL angegeben)
      // http://localhost:4200/example/iQmmKETxbihQVI6EtKZ8
      // this.getActiveUser(this.itemID);

      // Beispielhafter Aufruf (hard gecoded)
      this.getActiveUser('iQmmKETxbihQVI6EtKZ8');
    });
  }

  getActiveUser(itemID: string) {
    this.firestore.getSingleUserData(itemID, () => {
      this.user = new User(this.firestore.user);
    });
  }  
}
