import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { MembershipStatus } from './shared/common/models';
import { AuthStateModel } from './shared/state/auth/auth.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'vidhya-ui';

  // @Select(AuthState)
  // authState$: Observable<AuthStateModel>;
  // authState: AuthStateModel = {};
  isLoggedIn: boolean = true;
  membershipStatus: MembershipStatus = null;
  showApp: boolean = false;

  constructor(private store: Store) {
    // this.authState$.subscribe((val) => {
    //   this.authState = val;
    //   this.isLoggedIn = this.authState.isLoggedIn;
    //   this.membershipStatus = this.authState.membershipStatus;
    //   this.showApp = this.isLoggedIn && this.membershipStatus != null;
    //   console.log('deciding whether to show the app or not ', {
    //     showapp: this.showApp,
    //   });
    // });
  }

  ngOnInit(): void {
    // this.checkAuthentication();
  }

  // checkAuthentication() {
  //   this.store.dispatch(new AuthenticationCheckAction());
  // }

  ngOnDestroy() {}
}
