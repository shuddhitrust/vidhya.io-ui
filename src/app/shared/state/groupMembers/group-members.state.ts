import { State, Action, StateContext, Selector } from '@ngxs/store';
import {
  defaultGroupMemberState,
  GroupMemberStateModel,
} from './group-members.model';

import { Injectable } from '@angular/core';

@State<GroupMemberStateModel>({
  name: 'groupMemberState',
  defaults: defaultGroupMemberState,
})
@Injectable()
export class GroupMemberState {
  constructor() {}
}
