import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetAuthStorage } from './modules/auth/state/auth.actions';
import { AuthState } from './modules/auth/state/auth.state';
import { uiroutes } from './shared/common/ui-routes';

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

  ngOnDestroy() {}
}
