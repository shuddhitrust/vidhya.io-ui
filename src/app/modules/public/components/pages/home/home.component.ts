import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { VerifyAccountAction, firstTimeSetupAction } from 'src/app/modules/auth/state/auth.actions';
import { AuthStateModel } from 'src/app/modules/auth/state/auth.model';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { MembershipStatusOptions } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { LoginModalComponent } from '../../../../auth/components/login/login-modal.component';
import { SocialAuthAccessAction } from 'src/app/modules/auth/state/auth.actions';
import {
  getParamsObjectFromHash
} from 'src/app/shared/common/functions';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush //// this line

})
export class HomeComponent implements OnInit {
  url: string;
  currentYear = new Date().getFullYear();
  privacyRoute = uiroutes.PRIVACY_ROUTE.route;
  termsConditionsRoute = uiroutes.TERMS_CONDITIONS_ROUTE.route;
  @Select(AuthState.getIsLoggedIn)
  isLoggedIn$: Observable<boolean>;
  @Select(AuthState.getIsGoogleLoggedIn)
  isGoogleLoggedIn$: Observable<boolean>;
  @Select(AuthState.getCurrentMemberStatus)
  membershipStatus$: Observable<string>;
  @Select(AuthState.getFirstTimeSetup)
  firstTimeSetup$: Observable<any>;
  // @Select(AuthState.getChangePassword)
  // isChangePasswordEnable$: Observable<string>;
  membershipStatus: string;
  authState: AuthStateModel;
  isLoggedIn: boolean = false;
  firstTimeSetup: boolean = false;
  // isChangePasswordEnable: string;
  navigationSubscription: any;
  isGoogleLogin: boolean = false;
  isChangePasswordEnable: boolean = false;
  public ngDestroyed$ = new Subject();

  constructor(
    private store: Store,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.isLoggedIn$
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe((val) => {
      this.isLoggedIn = val;
    });

    // Code to decode the hash value from the browser URL for Google
    if (window.location.hash) {
      this.checkGoogleLoginHash();
    }

    this.membershipStatus$
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe((val) => {
      if (this.membershipStatus != val && val !== undefined) {
        this.membershipStatus = val;
        this.processMembershipStatusOptions();
      }
    });

    // let loadingFirstScreenAfterLogin = concat(
    //   this.firstTimeSetup$,
    //   this.isChangePasswordEnable$
    // )
    // loadingFirstScreenAfterLogin.subscribe((res) => {
    //   this.firstTimeSetup = res[0];    
    //   this.isChangePasswordEnable = res[1];
    //   if (this.firstTimeSetup && !this.isChangePasswordEnable) {
    //     // If this is the first time user is logging in, redirect to member form page
    //     // to update their profile info.
    //     this.router.navigate([uiroutes.CHANGE_PASSWORD.route]);
    //   }else if(this.firstTimeSetup && this.isChangePasswordEnable){
    //     // If this is the first time user is logging in & password changes, redirect to member form page
    //     // to update their profile info.
    //     this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route]);
    //   }
    // });

    this.firstTimeSetup$
    .pipe(takeUntil(this.ngDestroyed$))
    .subscribe((status) => {
      if (status) {
        this.store.dispatch(new firstTimeSetupAction({ firstTimeSetup: status }));
        this.firstTimeSetup = status?.firstTimeSetup;
        this.isGoogleLogin = status?.isGoogleLoggedIn;
        this.isChangePasswordEnable = status?.isChangePasswordEnable;
        if (status?.firstTimeSetup == true && status?.isChangePasswordEnable == true) {
          this.router.navigate([uiroutes.CHANGE_PASSWORD.route]);
        } else if (status?.firstTimeSetup == true && (status?.isChangePasswordEnable == false || status?.isGoogleLogin == true)) {
          this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route]);
        }
        // this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route]);

        // this.isChangePasswordEnable$.subscribe((val2) => {
        //   this.isChangePasswordEnable = val2;
        //   if (this.firstTimeSetup && !this.isChangePasswordEnable) {
        //     // If this is the first time user is logging in, redirect to member form page
        //     // to update their profile info.
        //     this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route]);

        //   } else if (this.firstTimeSetup && this.isChangePasswordEnable) {
        //     // If this is the first time user is logging in & password changes, redirect to member form page
        //     // to update their profile info.
        //     this.router.navigate([uiroutes.CHANGE_PASSWORD.route]);

        //   }
        // })
        // this.isGoogleLoggedIn$.subscribe((status) => {
        //   this.isGoogleLogin = status
        //   if (this.firstTimeSetup && this.isGoogleLogin) {
        //     this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route]);
        //   }
        // })
      }
    });


    // this.pendingApproval =
    //   this.authState.membershipStatus == MembershipStatusOptions.PENDING_APPROVAL;
    // this.suspended =
    //   this.authState.membershipStatus == MembershipStatusOptions.SUSPENDED;
  }
  initialiseInvites() {
    // Set default values and re-fetch any data you need.
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

  //Method to get accesstoken and other details from google SSO hash URL
  checkGoogleLoginHash() {
    let routeUriHashObject = getParamsObjectFromHash();
    if (routeUriHashObject) {
      let socialAuthData = { accessToken: routeUriHashObject['access_token'], provider: 'google-oauth2' }
      this.isGoogleLogin = true;
      this.store.dispatch(new SocialAuthAccessAction({ socialAuthData }));
      this.router.routeReuseStrategy.shouldReuseRoute = function () {
        return false;
      }
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['/']);
    }
  }
  ngOnDestroy() {
    this.ngDestroyed$.next();
  }

}
