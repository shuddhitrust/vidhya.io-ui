import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MembershipStatus } from '../../common/models';
import { uiroutes } from '../../common/ui-routes';
import { LoginAction, LogoutAction } from '../../state/auth/auth.actions';
import { AuthStateModel } from '../../state/auth/auth.model';
import { AuthState } from '../../state/auth/auth.state';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  dashboardRoute: string = uiroutes.DASHBOARD_ROUTE;
  profileRoute: string = uiroutes.MEMBER_PROFILE_ROUTE;
  accountRoute: string = uiroutes.ACCOUNT_ROUTE;
  supportRoute: string = uiroutes.SUPPORT_ROUTE;
  @Select(AuthState)
  authState$: Observable<AuthStateModel>;
  authState: AuthStateModel;
  isLoggedIn: boolean;
  isFullyAuthenticated: Boolean;
  membershipStatus: MembershipStatus;
  approved: boolean;

  constructor(private store: Store) {
    this.authState$.subscribe((val) => {
      this.authState = val;
      this.isLoggedIn = this.authState.isLoggedIn;
      this.isFullyAuthenticated = this.authState.isFullyAuthenticated;
      // this.membershipStatus = this.authState.membershipStatus;
      // this.approved = this.membershipStatus == MembershipStatus.ACTIVE;
    });
  }

  login() {
    this.store.dispatch(new LoginAction());
  }

  logout() {
    this.store.dispatch(new LogoutAction());
  }
  ngOnInit(): void {}
}
