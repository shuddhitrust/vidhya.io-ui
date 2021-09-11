import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { uiroutes } from './shared/common/ui-routes';
import { AuthenticationCheckAction } from './shared/state/auth/auth.actions';
import { AuthState } from './shared/state/auth/auth.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'vidhya-ui';
  uiroutes = uiroutes;
  @Select(AuthState.getIsFullyAuthenticated)
  isFullyAuthenticated$: Observable<boolean>;
  @Select(AuthState.getFirstTimeSetup)
  firstTimeSetup$: Observable<boolean>;
  firstTimeSetup;
  constructor(
    private store: Store,
    private router: Router,
    private readonly location: Location
  ) {
    this.firstTimeSetup$.subscribe((val) => {
      this.firstTimeSetup = val;
    });
  }

  currentRoute(): string {
    return this.location.path().substring(1);
  }

  showHomePage() {
    // Make sure to add the routes of other components that are allowed to be shown when not logged in fully
    return (
      this.currentRoute() != uiroutes.MEMBER_FORM_ROUTE.route &&
      !this.currentRoute()
        .toString()
        .includes(uiroutes.PASSWORD_RESET_ROUTE.route)
    );
  }

  showUnprotectedPage(route) {
    switch (route) {
      case uiroutes.PASSWORD_RESET_ROUTE.route:
        if (this.router.url.includes(uiroutes.PASSWORD_RESET_ROUTE.route)) {
          return true;
        }
        break;
      case uiroutes.MEMBER_FORM_ROUTE.route:
        if (
          this.firstTimeSetup &&
          this.currentRoute() == uiroutes.MEMBER_FORM_ROUTE.route
        ) {
          return true;
        }
        break;
      default:
        this.router.navigate[uiroutes.HOME_ROUTE.route];
    }
    return false;
  }

  ngOnInit(): void {
    this.checkAuthentication();
  }
  checkAuthentication() {
    this.store.dispatch(new AuthenticationCheckAction());
  }

  ngOnDestroy() {}
}
