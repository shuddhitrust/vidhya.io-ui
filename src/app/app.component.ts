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

  @Select(AuthState.getIsLoggedIn)
  isLoggedIn$: Observable<boolean>;
  showApp: boolean = false;

  constructor(private store: Store, private router: Router) {
    this.isLoggedIn$.subscribe((val) => {
      this.showApp = val;
    });
  }

  showUnprotectedPage(route) {
    switch (route) {
      case uiroutes.PASSWORD_RESET:
        if (this.router.url.includes(uiroutes.PASSWORD_RESET)) {
          return true;
        }
        break;
      case uiroutes.HOME:
        if (this.router.url === uiroutes.HOME) {
          return true;
        }
        break;
      default:
        this.router.navigate[uiroutes.HOME];
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
