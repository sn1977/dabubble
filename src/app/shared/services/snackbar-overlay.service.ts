import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { EmojiSnackbarComponent } from '../components/emoji-snackbar/emoji-snackbar.component';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarOverlayService {
  constructor(private overlay: Overlay, private injector: Injector) {}

  open({ emoji, user }: { emoji: string, user: string }) {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const overlayConfig = new OverlayConfig({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      positionStrategy
    });

    const overlayRef = this.overlay.create(overlayConfig);

    const injectionTokens = new WeakMap();
    injectionTokens.set(MAT_SNACK_BAR_DATA, { emoji, user });

    const emojiSnackbarPortal = new ComponentPortal(EmojiSnackbarComponent, null, Injector.create({ parent: this.injector, providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: { emoji, user } }
      ]}));

    overlayRef.attach(emojiSnackbarPortal);

    setTimeout(() => {
      overlayRef.detach();
    }, 2000);
  }
}
