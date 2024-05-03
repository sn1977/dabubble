import { Component } from '@angular/core';
import { HeaderMobileComponent } from "../header-mobile/header-mobile.component";

@Component({
    selector: 'app-desktop-headline',
    standalone: true,
    templateUrl: './desktop-headline.component.html',
    styleUrl: './desktop-headline.component.scss',
    imports: [HeaderMobileComponent]
})
export class DesktopHeadlineComponent {

}
