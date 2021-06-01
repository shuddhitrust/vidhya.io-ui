import { typeWithParameters } from '@angular/compiler/src/render3/util';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MembershipStatus } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  ResendActivationEmailAction,
  VerifyAccountAction,
} from 'src/app/shared/state/auth/auth.actions';
import { AuthStateModel } from 'src/app/shared/state/auth/auth.model';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { membershipStatusOptions } from 'src/app/shared/state/members/member.model';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  url: string;
  @Select(AuthState)
  authState$: Observable<AuthStateModel>;
  authState: AuthStateModel;
  pendingApproval: boolean = false;
  suspended: boolean = false;
  showAnnouncements: boolean = true;
  isLoggedIn: boolean = false;
  isVerified: boolean = false;
  firstTimeSetup: boolean = false;
  showUnverifiedNotification: boolean = false;
  constructor(private store: Store, private router: Router) {
    this.authState$.subscribe((val) => {
      this.authState = val;
      this.isLoggedIn = this.authState?.isLoggedIn;
      this.isVerified = this.authState.currentMember?.verified;
      this.showUnverifiedNotification = this.isLoggedIn && !this.isVerified;
      this.firstTimeSetup = this.authState.firstTimeSetup;
      if (this.firstTimeSetup && this.isVerified) {
        this.router.navigate([uiroutes.MEMBER_FORM_ROUTE]);
        this.store.dispatch(
          new ShowNotificationAction({
            message:
              'Please fill this form and submit before being able to browse the application.',
            action: 'show',
          })
        );
      }
      this.pendingApproval =
        this.authState.currentMember.membershipStatus ==
        MembershipStatus.PENDING;
      if (this.pendingApproval) {
        this.store.dispatch(
          new ShowNotificationAction({
            message:
              "Your account is pending approval by your institution's moderators. Please wait for them to approve you.",
            action: 'show',
            autoClose: false,
          })
        );
      }
      // this.pendingApproval =
      //   this.authState.membershipStatus == MembershipStatus.PENDING_APPROVAL;
      // this.suspended =
      //   this.authState.membershipStatus == MembershipStatus.SUSPENDED;
      console.log('from the home page => ', {
        pendingApproval: this.pendingApproval,
        suspended: this.suspended,
      });
    });
  }

  closeAnnouncements() {
    console.log('clicked on close announcements');
    this.showAnnouncements = false;
  }

  resendActivationEmail() {
    this.store.dispatch(new ResendActivationEmailAction());
  }

  activateAccount() {
    this.url = window.location.href;
    console.log('this.url => ', { url: this.url });
    if (this.url.includes(uiroutes.ACTIVATE_ACCOUNT)) {
      console.log('account activation!!!');
      const token = this.url.split(uiroutes.ACTIVATE_ACCOUNT + '/')[1];
      this.store.dispatch(new VerifyAccountAction({ token }));
    }
  }

  ngOnInit(): void {
    this.activateAccount();
  }
}
