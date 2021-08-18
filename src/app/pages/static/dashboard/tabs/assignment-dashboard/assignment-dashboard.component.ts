import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { autoGenOptions, parseDateTime } from 'src/app/shared/common/functions';
import {
  ExerciseSubmissionStatusOptions,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchAssignmentsAction,
  FetchNextAssignmentsAction,
} from 'src/app/shared/state/assignments/assignment.actions';
import { AssignmentState } from 'src/app/shared/state/assignments/assignment.state';

import { Assignment } from 'src/app/shared/state/assignments/assignment.model';

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
  exerciseSubmissionColumnFilters = {};
  submissionStatusFilter: string = null;
  groupByFilter: string = resources.CHAPTER;
  assignmentColumnFilters: any = {
    groupBy: this.groupByFilter,
    status: this.submissionStatusFilter,
  };
  exerciseSubmissionStatusOptions: MatSelectOption[] = autoGenOptions({
    all: null,
    ...ExerciseSubmissionStatusOptions,
  });
  @Select(AssignmentState.listAssignments)
  assignments$: Observable<Assignment[]>;
  assignments: Assignment[] = [];

  @Select(AssignmentState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.fetchAssignments();
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
    this.assignments$.subscribe((val) => {
      console.log('new assignments', { assignments: val });
      this.assignments = val ? val : [];
    });
  }

  parseDate(date) {
    return parseDateTime(date);
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  ngOnInit(): void {}
  onScroll() {
    console.log('scrolling groups');
    if (!this.isFetching) {
      this.fetchNextAssignments();
    }
  }

  statusIcon(card): { icon: string; iconColor: string } {
    let icon = null;
    let iconColor = null;
    switch (card.status) {
      case ExerciseSubmissionStatusOptions.pending:
        icon = 'new_releases';
        iconColor = 'var(--orange)';
        break;
      case ExerciseSubmissionStatusOptions.submitted:
        icon = 'done';
        iconColor = 'var(--green)';
        break;
      case ExerciseSubmissionStatusOptions.graded:
        icon = 'done_all';
        iconColor = 'var(--green)';
        break;
      case ExerciseSubmissionStatusOptions.returned:
        icon = 'cancel';
        iconColor = 'var(--red)';
        break;
    }
    return { icon, iconColor };
  }

  updateAssignmentFilter() {
    this.assignmentColumnFilters = {
      status: this.submissionStatusFilter,
    };
  }

  fetchAssignments() {
    this.updateAssignmentFilter();
    this.store.dispatch(
      new FetchAssignmentsAction({
        searchParams: {
          ...defaultSearchParams,
          columnFilters: this.assignmentColumnFilters,
        },
      })
    );
  }

  fetchNextAssignments() {
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextAssignmentsAction());
    }
  }

  openChapter(chapter) {
    this.router.navigate([uiroutes.CHAPTER_PROFILE_ROUTE.route], {
      queryParams: { id: chapter.id },
    });
  }
}
