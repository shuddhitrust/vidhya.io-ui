import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  Assignment,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchAssignmentsAction,
  FetchNextAssignmentsAction,
} from 'src/app/shared/state/assignments/assignment.actions';
import { AssignmentState } from 'src/app/shared/state/assignments/assignment.state';

@Component({
  selector: 'app-assignment-dashboard',
  templateUrl: './assignment-dashboard.component.html',
  styleUrls: [
    './assignment-dashboard.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class AssignmentDashboardComponent implements OnInit {
  resource: string = resources.ANNOUNCEMENT;
  resourceActions = RESOURCE_ACTIONS;

  @Select(AssignmentState.listAssignments)
  assignments$: Observable<Assignment[]>;

  @Select(AssignmentState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.store.dispatch(
      new FetchAssignmentsAction({ searchParams: defaultSearchParams })
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
    console.log('scrolling groups');
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextAssignmentsAction());
    }
  }
  createAssignment() {
    this.router.navigateByUrl(uiroutes.ASSIGNMENT_FORM_ROUTE.route);
  }

  openAssignment(assignment) {
    this.router.navigate([uiroutes.ASSIGNMENT_PROFILE_ROUTE.route], {
      queryParams: { id: assignment.id },
    });
  }
}
