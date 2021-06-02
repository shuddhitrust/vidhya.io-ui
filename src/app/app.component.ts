import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthenticationCheckAction } from './shared/state/auth/auth.actions';
import { AuthState } from './shared/state/auth/auth.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'vidhya-ui';

  @Select(AuthState.getIsLoggedIn)
  isLoggedIn$: Observable<boolean>;
  showApp: boolean = false;

  constructor(private store: Store) {
    this.isLoggedIn$.subscribe((val) => {
      this.showApp = val;
    });
  }

  ngOnInit(): void {
    this.checkAuthentication();
  }
  checkAuthentication() {
    this.store.dispatch(new AuthenticationCheckAction());
  }

  ngOnDestroy() {}
}
