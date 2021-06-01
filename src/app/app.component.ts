import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { uiroutes } from './shared/common/ui-routes';
import { AuthenticationCheckAction } from './shared/state/auth/auth.actions';
import { AuthStateModel } from './shared/state/auth/auth.model';
import { AuthState } from './shared/state/auth/auth.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'vidhya-ui';

  @Select(AuthState)
  authState$: Observable<AuthStateModel>;
  authState: AuthStateModel;
  isLoggedIn: boolean = false;
  isVerified: boolean = false;
  membershipStatus: string = null;
  firstTimeSetup: boolean = false;
  isFullyAuthenticated: boolean = false;
  showApp: boolean = false;

  constructor(private store: Store, private router: Router) {
    console.log('from app.component.ts => constructor!!!');
    this.authState$.subscribe((val) => {
      this.authState = val;
      this.isLoggedIn = this.authState.isLoggedIn;
      this.isVerified = this.authState.currentMember?.verified;
      this.showApp = this.isLoggedIn && this.isVerified;
    });
  }

  ngOnInit(): void {
    this.checkAuthentication();
  }
  checkAuthentication() {
    this.store.dispatch(new AuthenticationCheckAction());
  }

  ngOnDestroy() {}
}
