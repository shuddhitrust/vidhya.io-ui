import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { authorizeResource } from 'src/app/shared/common/functions';
import {
  Assignment,
  resources,
  RESOURCE_ACTIONS,
  UserPermissions,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { FetchAssignmentsAction } from 'src/app/shared/state/assignments/assignment.actions';
import { AssignmentState } from 'src/app/shared/state/assignments/assignment.state';
import { AuthState } from 'src/app/shared/state/auth/auth.state';

@Component({
  selector: 'app-assignment-dashboard',
  templateUrl: './assignment-dashboard.component.html',
  styleUrls: [
    './assignment-dashboard.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class AssignmentDashboardComponent implements OnInit {
  resource: string = resources.ANNOUNCEMENTS;
  resourceActions = RESOURCE_ACTIONS;
  @Select(AuthState.getPermissions)
  permissions$: Observable<UserPermissions>;
  permissions: UserPermissions;

  @Select(AssignmentState.listAssignments)
  assignments$: Observable<Assignment[]>;

  @Select(AssignmentState.isFetching)
  isFetching$: Observable<boolean>;

  constructor(private store: Store, private router: Router) {
    this.permissions$.subscribe((val) => {
      this.permissions = val;
    });
    this.store.dispatch(
      new FetchAssignmentsAction({ searchParams: defaultSearchParams })
    );
  }
  authorizeResourceMethod(action) {
    return authorizeResource(this.permissions, this.resource, action);
  }

  ngOnInit(): void {}

  createAssignment() {
    this.router.navigateByUrl(uiroutes.ASSIGNMENT_FORM_ROUTE);
  }

  openAssignment(assignment) {
    this.router.navigate([uiroutes.ASSIGNMENT_PROFILE_ROUTE], {
      queryParams: { id: assignment.id },
    });
  }
}
