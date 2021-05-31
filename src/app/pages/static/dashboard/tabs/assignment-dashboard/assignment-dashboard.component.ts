import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { Assignment } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { FetchAssignmentsAction } from 'src/app/shared/state/assignments/assignment.actions';
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
  @Select(AssignmentState.listAssignments)
  assignments$: Observable<Assignment[]>;

  @Select(AssignmentState.isFetching)
  isFetching$: Observable<boolean>;

  constructor(private store: Store, private router: Router) {
    this.store.dispatch(
      new FetchAssignmentsAction({ searchParams: defaultSearchParams })
    );
  }

  ngOnInit(): void {}

  createAssignment() {
    this.router.navigateByUrl(uiroutes.ASSIGNMENT_FORM_ROUTE);
  }

  openAssignment(assignment) {
    this.router.navigate([uiroutes.ASSIGNMENT_PAGE_ROUTE], {
      queryParams: { id: assignment.id },
    });
  }
}
