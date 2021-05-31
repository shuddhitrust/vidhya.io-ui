import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoginModalComponent } from 'src/app/pages/modals/login/login-modal.component';
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

  constructor(private store: Store, public dialog: MatDialog) {
    this.authState$.subscribe((val) => {
      this.authState = val;
      this.isLoggedIn = this.authState.isLoggedIn;
      this.isFullyAuthenticated = this.authState.isFullyAuthenticated;
    });
  }

  login() {
    const dialogRef = this.dialog.open(LoginModalComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  logout() {
    this.store.dispatch(new LogoutAction());
  }
  ngOnInit(): void {}
}
