import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

export const routes: Routes = [  
  { path: '', component: AppComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },

  // { path: '', component: ComponentName },
  // { path: '', component: ComponentName },
  // { path: '', component: ComponentName },
  // { path: '', component: ComponentName },

];
