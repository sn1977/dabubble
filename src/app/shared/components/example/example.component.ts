import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../../../models/user.class';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss'
})
export class ExampleComponent implements OnInit{
  ngOnInit(): void {
    this.getActiveUser('iQmmKETxbihQVI6EtKZ8');
  }

  firestore = inject(FirebaseService);
  user: User = new User();

  getActiveUser(userID: string){
    this.firestore.getSingleUserData(userID, () => {
      this.user = new User(this.firestore.user);
    });
  }
}
