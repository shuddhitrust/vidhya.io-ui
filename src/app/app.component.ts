import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import Observable from 'zen-observable';
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
  isFullyAuthenticated: boolean = false;
  showApp: boolean = false;

  constructor(private store: Store) {
    this.authState$.subscribe((val) => {
      this.authState = val;
      this.isLoggedIn = this.authState.isLoggedIn;
      this.isFullyAuthenticated = this.authState.isFullyAuthenticated;
      this.showApp = this.isLoggedIn && this.isFullyAuthenticated;
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
