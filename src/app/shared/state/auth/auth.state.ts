import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { AuthStateModel, defaultAuthState } from './auth.model';

import { Injectable } from '@angular/core';

@State<AuthStateModel>({
  name: 'authState',
  defaults: defaultAuthState,
})
@Injectable()
export class AuthState {
  constructor() {}
}
