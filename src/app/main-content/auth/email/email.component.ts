import { Component, inject } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { VerifyAndChangeEmailComponent } from '../verify-and-change-email/verify-and-change-email.component';

@Component({
  selector: 'app-email',
  standalone: true,
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss',
  imports: [NgIf, ResetPasswordComponent, VerifyAndChangeEmailComponent],
})
export class EmailComponent {
  /**
   * The authentication service used for handling email authentication.
   */
  authService = inject(AuthService);
  /**
   * The mode of the email component.
   * It can be either a string or null.
   */
  mode: string | null = null;
  /**
   * The oobCode used for email authentication.
   * It can be either a string or null.
   */
  oobCode: string | null = null;

  /**
   * Constructs a new instance of the EmailComponent class.
   * @param route - The ActivatedRoute instance.
   */
  constructor(private route: ActivatedRoute) {}

  /**
   * Initializes the component.
   * Retrieves the query parameters from the route and assigns them to the corresponding properties.
   */
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(
      (params: { get: (arg0: string) => string | null; keys: any }) => {
        this.mode = params.get('mode');
        this.oobCode = params.get('oobCode');
      }
    );
  }

  /**
   * Retrieves the value of a query parameter from the URL.
   * 
   * @param name - The name of the query parameter.
   * @returns The value of the query parameter, or `null` if it doesn't exist.
   */
  getParameterByName(arg0: string) {
    throw new Error('Function not implemented.');
  }
}
