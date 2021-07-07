import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  authorizeResource,
  parseDateTime,
} from 'src/app/shared/common/functions';
import {
  Group,
  resources,
  RESOURCE_ACTIONS,
  User,
  UserPermissions,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import {
  FetchGroupsAction,
  ResetGroupFormAction,
} from 'src/app/shared/state/groups/group.actions';
import { GroupState } from 'src/app/shared/state/groups/group.state';

@Component({
  selector: 'app-group-dashboard',
  templateUrl: './group-dashboard.component.html',
  styleUrls: [
    './group-dashboard.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class GroupDashboardComponent implements OnInit {
  resource: string = resources.ANNOUNCEMENTS;
  resourceActions = RESOURCE_ACTIONS;
  @Select(AuthState.getPermissions)
  permissions$: Observable<UserPermissions>;
  permissions: UserPermissions;
  @Select(GroupState.listGroups)
  groups$: Observable<Group[]>;

  @Select(GroupState.isFetching)
  isFetching$: Observable<boolean>;

  constructor(private store: Store, private router: Router) {
    this.permissions$.subscribe((val) => {
      this.permissions = val;
    });
    this.store.dispatch(
      new FetchGroupsAction({ searchParams: defaultSearchParams })
    );
  }
  authorizeResourceMethod(action) {
    return authorizeResource(this.permissions, this.resource, action);
  }

  ngOnInit(): void {}

  clip(string) {
    const clipLength = 50;
    return string.slice(0, clipLength);
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  createGroup() {
    this.store.dispatch(new ResetGroupFormAction());
    this.router.navigateByUrl(uiroutes.GROUP_FORM_ROUTE);
  }

  openGroup(group) {
    this.router.navigate([uiroutes.GROUP_PROFILE_ROUTE], {
      queryParams: { id: group.id },
    });
  }
}
