import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { autoGenOptions } from 'src/app/shared/common/functions';
import {
  Chapter,
  ExerciseSubmissionStatusOptions,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchChaptersAction,
  FetchNextChaptersAction,
} from 'src/app/shared/state/chapters/chapter.actions';
import { Assignment } from 'src/app/shared/state/chapters/chapter.model';
import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';
import {
  FetchGradingGroupsAction,
  FetchNextGradingGroupsAction,
} from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.actions';
import { GradingGroup } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.model';
import { ExerciseSubmissionState } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.state';

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
  submissionStatusFilter: string = ExerciseSubmissionStatusOptions.submitted;
  groupByFilter: string = resources.CHAPTER;
  assignmentColumnFilters: any = {
    groupBy: this.groupByFilter,
    status: this.submissionStatusFilter,
  };
  exerciseSubmissionStatusOptions: MatSelectOption[] = autoGenOptions(
    ExerciseSubmissionStatusOptions
  );
  @Select(ChapterState.listAssignments)
  assignmentCards$: Observable<Assignment[]>;
  assignmentCards: Assignment[];

  @Select(ChapterState.isFetching)
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
    this.assignmentCards$.subscribe((val) => {
      this.assignmentCards = val;
    });
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  ngOnInit(): void {}
  onScroll() {
    console.log('scrolling groups');
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextChaptersAction());
    }
  }

  updateAssignmentFilter() {
    this.assignmentColumnFilters = {
      groupBy: this.groupByFilter,
      status: this.submissionStatusFilter,
    };
  }

  fetchAssignments() {
    this.updateAssignmentFilter();
    this.store.dispatch(
      new FetchGradingGroupsAction({
        searchParams: {
          ...defaultSearchParams,
          columnFilters: this.assignmentColumnFilters,
        },
      })
    );
  }

  fetchNextAssignmentGroups() {
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextGradingGroupsAction());
    }
  }

  openChapter(chapter) {
    this.router.navigate([uiroutes.CHAPTER_PROFILE_ROUTE.route], {
      queryParams: { id: chapter.id },
    });
  }
}
