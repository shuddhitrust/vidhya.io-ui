import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { parseDateTime } from 'src/app/shared/common/functions';
import {
  Group,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchGroupsAction,
  FetchNextGroupsAction,
  ResetGroupFormAction,
} from '../../state/group.actions';
import { GroupState } from '../../state/group.state';

@Component({
  selector: 'app-group-dashboard',
  templateUrl: './group-dashboard.component.html',
  styleUrls: [
    './group-dashboard.component.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
})
export class GroupDashboardComponent implements OnInit {
  resource: string = resources.ANNOUNCEMENT;
  resourceActions = RESOURCE_ACTIONS;
  @Select(GroupState.listGroups)
  groups$: Observable<Group[]>;

  @Select(GroupState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.store.dispatch(
      new FetchGroupsAction({ searchParams: defaultSearchParams })
    );
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  ngOnInit(): void {}
  onScroll() {
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextGroupsAction());
    }
  }
  clip(string) {
    const clipLength = 50;
    return string.slice(0, clipLength);
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  createGroup() {
    this.store.dispatch(new ResetGroupFormAction());
    this.router.navigateByUrl(uiroutes.GROUP_FORM_ROUTE.route);
  }

  openGroup(group) {
    this.router.navigate([uiroutes.GROUP_PROFILE_ROUTE.route], {
      queryParams: { id: group.id },
    });
  }
}
