import { Routes } from '@angular/router';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { MainContentComponent } from './main-content/main-content.component';
import { RegisterComponent } from './main-content/register/register.component';
import { LogInComponent } from './main-content/log-in/log-in.component';
import { AddChannelComponent } from './main-content/add-channel/add-channel.component';
import { NewChannelComponent } from './main-content/new-channel/new-channel.component';
import { IsAdminGuard } from './shared/services/authguard.service';
import { SendEmailComponent } from './main-content/send-email/send-email.component';
import { ResetPasswordComponent } from './main-content/reset-password/reset-password.component';
import { DirectMessageComponent } from './main-content/direct-message/direct-message.component';
import { NewMessageComponent } from './main-content/new-message/new-message.component';
import { ChannelEditionComponent } from './main-content/channel-edition/channel-edition.component';
import { ChooseAvatarComponent } from './main-content/register/choose-avatar/choose-avatar.component';

export const routes: Routes = [
  { path: '', component: MainContentComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'add-channel', component: AddChannelComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'choose-avatar', component: ChooseAvatarComponent },
  { path: 'login', component: LogInComponent },
  { path: 'send-email', component: SendEmailComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'new-channel', component: NewChannelComponent },
  { path: 'message', component: DirectMessageComponent },
  { path: 'new-message', component: NewMessageComponent},
  { path: 'channel-edition', component: ChannelEditionComponent},

  // { path: 'newchannel', component: NewChannelComponent, canActivate:[IsAdminGuard]},
  // { path: '', component: ComponentName },
  // { path: '', component: ComponentName },
  // { path: '', component: ComponentName },
  // { path: '', component: ComponentName },
];
