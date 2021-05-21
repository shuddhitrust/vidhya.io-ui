import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Group } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { FetchGroups } from 'src/app/shared/state/groups/group.actions';
import { GroupState } from 'src/app/shared/state/groups/group.state';

@Component({
  selector: 'app-group-dashboard',
  templateUrl: './group-dashboard.component.html',
  styleUrls: ['./group-dashboard.component.scss'],
})
export class GroupDashboardComponent implements OnInit {
  @Select(GroupState.listGroups)
  groups$: Observable<Group[]>;

  @Select(GroupState.isFetching)
  isFetching$: Observable<boolean>;

  constructor(private store: Store, private router: Router) {
    this.store.dispatch(new FetchGroups());
  }

  ngOnInit(): void {}

  createGroup() {
    this.router.navigateByUrl(uiroutes.GROUP_FORM_ROUTE);
  }

  openGroup(group) {
    this.router.navigate([uiroutes.GROUP_PROFILE_ROUTE], {
      queryParams: { id: group.id },
    });
  }
}