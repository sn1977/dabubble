import {Component, OnInit, inject} from '@angular/core';
import {FirebaseService} from '../shared/services/firebase.service';
import {HeaderMobileComponent} from '../shared/components/header-mobile/header-mobile.component';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  MatAccordion, MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {BottomSheetComponent} from './bottom-sheet/bottom-sheet.component';
import {MatFabButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {NavigationService} from '../shared/services/navigation.service';
import {Router, RouterLink} from '@angular/router';
import {Auth} from '@angular/fire/auth';
import {AuthService} from '../shared/services/auth.service';
import {ItemStateService} from '../shared/services/item-state.service';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatExpansionModule,
    HeaderMobileComponent,
    BottomSheetComponent,
    MatFabButton,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {
  firestore = inject(FirebaseService);
  router = inject(Router);
  firebaseAuth = inject(Auth);
  authService = inject(AuthService);

  panels = [
    {
      expanded: true,
      arrowImagePath: 'assets/img/icon/arrow_drop_down.png',
      iconPath: 'assets/img/icon/workspaces.png',
      title: 'Channels',
      titleColor: '#000000', // Startfarbe beim Öffnen
    },
    {
      expanded: true,
      arrowImagePath: 'assets/img/icon/arrow_drop_down.png',
      iconPath: 'assets/img/icon/account_circle_big.png',
      title: 'Direktnachrichten',
      titleColor: '#000000', // Startfarbe beim Öffnen
    }
  ];

  textData = {
    text: '',
  };

  inputHasValue = false;


  constructor(public navigationService: NavigationService,
              private itemStateService: ItemStateService) {
  }

  onPanelOpened(index: number) {
    this.panels[index].expanded = true;
    this.panels[index].arrowImagePath = 'assets/img/icon/arrow_drop_down.png';
    this.panels[index].iconPath = 'assets/img/icon/account_circle_big.png';
    this.panels[index].titleColor = '#000000'; // Farbe, wenn geöffnet
  }

  onPanelClosed(index: number) {
    this.panels[index].expanded = false;
    this.panels[index].arrowImagePath = 'assets/img/icon/arrow_drop_down_color.png';
    this.panels[index].iconPath = 'assets/img/icon/account_circle_color.png';
    this.panels[index].titleColor = '#535AF1'; // Farbe, wenn geschlossen
  }

  onAddClick(event: MouseEvent): void {
    event.stopPropagation(); // Verhindert, dass das Click-Event weiter zum mat-expansion-panel propagiert wird.
    this.navigateToAddChannel()
  }

  navigateToDirectMessage() {
    this.navigationService.navigate(['/message']);
    console.log(this.firebaseAuth.currentUser?.displayName);
    console.log(this.firebaseAuth.currentUser?.uid);
  }

  navigateToAddChannel() {
    this.navigationService.navigate(['/add-channel']);
  }

  checkInput(value: string): void {
    this.inputHasValue = !!value.trim();
  }

  openChannel (event: MouseEvent, path: string) {
    const docRefId = (event.currentTarget as HTMLElement).id;
    console.log('Öffne Collection ' + path + ' mit ID: ' + docRefId);
    this.itemStateService.setItemId(docRefId);
    this.router.navigate([path, docRefId]);
  }
}
