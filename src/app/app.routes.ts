import { Routes } from '@angular/router';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { MainContentComponent } from './main-content/main-content.component';
import { MessagerComponent } from './messager/messager.component';
import { ChannelComponent } from './channel/channel/channel.component';
import { RegisterComponent } from './main-content/register/register.component';
import { LogInComponent } from './main-content/log-in/log-in.component';
import { AddChannelComponent } from './add-channel/add-channel/add-channel.component';
import { NewChannelComponent } from './new-channel/new-channel.component';
import { IsAdminGuard } from './shared/services/authguard.service';

export const routes: Routes = [
  { path: '', component: MainContentComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'messager', component: MessagerComponent },
  { path: 'channel', component: ChannelComponent },
  { path: 'addchannel', component: AddChannelComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LogInComponent },
  { path: 'newchannel', component: NewChannelComponent },

  // { path: 'newchannel', component: NewChannelComponent, canActivate:[IsAdminGuard]},
  // { path: '', component: ComponentName },
  // { path: '', component: ComponentName },
  // { path: '', component: ComponentName },
  // { path: '', component: ComponentName },
];
