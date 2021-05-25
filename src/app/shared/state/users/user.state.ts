import { State, Store } from '@ngxs/store';
import { defaultUserState, UserStateModel } from './user.model';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';

@State<UserStateModel>({
  name: 'userState',
  defaults: defaultUserState,
})
@Injectable()
export class UserState {
  constructor(private store: Store, private apollo: Apollo) {}
}
