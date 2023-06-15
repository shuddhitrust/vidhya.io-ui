import { Location } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { GetAuthStorage } from './modules/auth/state/auth.actions';
import { AuthState } from './modules/auth/state/auth.state';
import { uiroutes } from './shared/common/ui-routes';
import { filter } from 'rxjs/operators';

declare var gtag: Function;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'vidhya-ui';
  uiroutes = uiroutes;
  @Select(AuthState.getIsFullyAuthenticated)
  isFullyAuthenticated$: Observable<boolean>;
  @Select(AuthState.getFirstTimeSetup)
  firstTimeSetup$: Observable<any>;
  firstTimeSetup;
  // @Select(AuthState.getChangePassword)
  // isChangePasswordEnable$: Observable<string>;
  isChangePasswordEnable;
  routerSubscription: Subscription;
  isGoogleLogin: any;
  constructor(
    private store: Store,
    private router: Router,
    private readonly location: Location
  ) {
    this.firstTimeSetup$.subscribe((val) => {
      this.firstTimeSetup = val?.firstTimeSetup;
      this.isGoogleLogin = val?.isGoogleLoggedIn;
      this.isChangePasswordEnable = val?.isChangePasswordEnable;
     
    });
    
    // this.isChangePasswordEnable$.subscribe((val)=>{
    //   this.isChangePasswordEnable = val;
    // });
  }

  ngAfterViewInit(): void {
    // subscribe to router events and send page views to Google Analytics
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        gtag('config', 'G-EN5L6B2N70', {
          page_path: event.urlAfterRedirects,
        });
      });
  }
  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  currentRoute(): string {
    return this.location.path().substring(1);
  }
  currentRouteNoteEquals(routes: string[]): boolean {
    let result = true;
    routes.forEach((r) => {
      result = result && !this.currentRoute().toString().includes(r);
    });
    return result;
  }

  ngOnInit(): void {
    this.checkAuthentication();
  }
  checkAuthentication() {
    this.store.dispatch(new GetAuthStorage());
  }
}
