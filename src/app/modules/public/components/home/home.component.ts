import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { VerifyAccountAction } from 'src/app/modules/auth/state/auth.actions';
import { AuthStateModel } from 'src/app/modules/auth/state/auth.model';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { MembershipStatusOptions } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { LoginModalComponent } from '../../../auth/components/login/login-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  url: string;
  currentYear = new Date().getFullYear();
  privacyRoute = uiroutes.PRIVACY_ROUTE.route;
  @Select(AuthState.getIsLoggedIn)
  isLoggedIn$: Observable<boolean>;
  @Select(AuthState.getCurrentMemberStatus)
  membershipStatus$: Observable<string>;
  @Select(AuthState.getFirstTimeSetup)
  firstTimeSetup$: Observable<boolean>;
  membershipStatus: string;
  authState: AuthStateModel;
  isLoggedIn: boolean = false;
  firstTimeSetup: boolean = false;

  constructor(
    private store: Store,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.isLoggedIn$.subscribe((val) => {
      this.isLoggedIn = val;
    });
    this.membershipStatus$.subscribe((val) => {
      if (this.membershipStatus != val && val !== undefined) {
        this.membershipStatus = val;
        this.processMembershipStatusOptions();
      }
    });

    this.firstTimeSetup$.subscribe((val) => {
      this.firstTimeSetup = val;
      if (this.firstTimeSetup) {
        // If this is the first time user is logging in, redirect to member form page
        // to update their profile info.
        this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route]);
      }
    });

    // this.pendingApproval =
    //   this.authState.membershipStatus == MembershipStatusOptions.PENDING_APPROVAL;
    // this.suspended =
    //   this.authState.membershipStatus == MembershipStatusOptions.SUSPENDED;
  }

  processMembershipStatusOptions() {
    if (this.membershipStatus == MembershipStatusOptions.PENDING) {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            "Your account is pending approval by your institution's moderators. Please wait for them to approve you.",
          action: 'show',
          autoClose: false,
          id: 'pendinig-approval',
        })
      );
    }
  }

  activateAccount() {
    this.url = window.location.href;

    if (this.url.includes(uiroutes.ACTIVATE_ACCOUNT_ROUTE.route)) {
      const token = this.url.split(
        uiroutes.ACTIVATE_ACCOUNT_ROUTE.route + '/'
      )[1];
      if (token) {
        this.store.dispatch(new VerifyAccountAction({ token }));
      }
    }
    if (this.url.includes(uiroutes.REGISTER_ROUTE.route)) {
      this.dialog.open(LoginModalComponent);
    }
  }

  ngOnInit(): void {
    this.activateAccount();
  }
}
