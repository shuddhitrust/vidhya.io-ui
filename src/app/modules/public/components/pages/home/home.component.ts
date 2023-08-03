import { ChangeDetectionStrategy, Component, OnInit,NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { VerifyAccountAction } from 'src/app/modules/auth/state/auth.actions';
import { AuthStateModel } from 'src/app/modules/auth/state/auth.model';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { CurrentMember, MembershipStatusOptions } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { LoginModalComponent } from '../../../../auth/components/login/login-modal.component';
import { SocialAuthAccessAction } from 'src/app/modules/auth/state/auth.actions';
import {
  getParamsObjectFromHash
} from 'src/app/shared/common/functions';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';

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
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  membershipStatus: string;
  authState: AuthStateModel;
  isLoggedIn: boolean = false;
  firstTimeSetup: boolean = false;
  navigationSubscription: any;
  isGoogleLogin: boolean = false;
  isChangePasswordEnable: boolean = false;
  public ngDestroyed$ = new Subject();

  constructor(
    private store: Store,
    private router: Router,
    public dialog: MatDialog,
    private ngZone: NgZone
  ) {
    this.isLoggedIn$
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe((val) => {
        this.isLoggedIn = val;
      });
    this.currentMember$
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe((val) => {
        if (this.isLoggedIn == true && this.firstTimeSetup == false && this.isChangePasswordEnable == false && val != undefined && val?.membershipStatus) {
          this.currentMember = val;
          this.processMemberFormValid();
        }
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

    this.firstTimeSetup$
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe((status) => {
        if (status) {
          this.firstTimeSetup = status?.firstTimeSetup;
          this.isGoogleLogin = status?.isGoogleLoggedIn;
          this.isChangePasswordEnable = status?.isChangePasswordEnable;
          if (status?.firstTimeSetup == true && status?.isChangePasswordEnable == true) {
            this.router.navigate([uiroutes.CHANGE_PASSWORD.route]);
          } else if (status?.firstTimeSetup == true && this.isLoggedIn && (status?.isChangePasswordEnable == false || status?.isGoogleLogin == true)) {
            this.ngZone.run(() =>this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route])).then();
          }
        }
      });

  }
  initialiseInvites() {
    // Set default values and re-fetch any data you need.
  }
  processMemberFormValid() {
    const regexStr = '^([a-zA-Z0-9_.]*)$';
    
    /**************************
     * 
     * !!!!IMPORTANT INFO:
     * Get all the required field from 
     * setupMemberFormGroup method in add-edit-member.component.ts and paste it to
     * the array variable requiredField
     * 
     * ** ********************/
    const requiredField = ['username', 'firstName', 'lastName', 'dob', 'email', 'institution', 'state', 'designation', 'gender'];
    let isEmptyFieldValueExist = requiredField.find(item => {
      if (!this.currentMember[item] && item!='dob') {
        return true;
      }
      if(item=='dob' && this.currentMember[item]){
        const today = new Date();
        let maxDob = new Date(
          today.getFullYear() - 10,
          today.getMonth(),
          today.getDate()
        );
        let validDobDate=  moment(new Date(this.currentMember[item])).isBefore(maxDob, 'day') ||moment(new Date(this.currentMember[item])).isSame(maxDob, 'day'); // false
          return validDobDate?false:true;
      }
      return false;
    })
    if(isEmptyFieldValueExist|| !new RegExp(regexStr, 'g').test(this.currentMember['username'])){
      this.ngZone.run(() =>this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route])).then();
    }
  }

  processMembershipStatusOptions() {
    if (this.membershipStatus == MembershipStatusOptions.PENDING) {
      this.router.navigate([uiroutes.MEMBERSHIPSTATUS_PENDING_STATE_ROUTE.route], { state: { 'firstName': this.currentMember?.firstName, 'lastName': this.currentMember?.lastName,'institution':this.currentMember?.institution } });
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
      this.dialog.open(LoginModalComponent, {
        height: '400px',
        width: '600px',
      });
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
