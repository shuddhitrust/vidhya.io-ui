import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  autoGenOptions,
  constructUserFullName,
} from 'src/app/shared/common/functions';
import {
  ExerciseSubmission,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchExerciseSubmissionsAction,
  FetchGradingGroupsAction,
  FetchNextExerciseSubmissionsAction,
  FetchNextGradingGroupsAction,
} from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.actions';
import { GradingGroup } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.model';
import { ExerciseSubmissionState } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.state';

const groupByTypes = {
  [resources.COURSE]: resources.COURSE,
  [resources.CHAPTER]: resources.CHAPTER,
  EXERCISE: resources.EXERCISE_SUBMISSION,
};

@Component({
  selector: 'app-grading-dashboard',
  templateUrl: './grading-dashboard.component.html',
  styleUrls: [
    './grading-dashboard.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class GradingDashboardComponent implements OnInit {
  opened: boolean = true;
  resource: string = resources.GRADING;
  resourceActions = RESOURCE_ACTIONS;
  groupByOptions: MatSelectOption[] = autoGenOptions(groupByTypes);
  groupBy: string = resources.EXERCISE_SUBMISSION;
  gradingGroupColumnFilters = { groupBy: this.groupBy };
  exerciseSubmissionColumnFilters = {};
  showGroupCards: boolean = true;
  submissionStatusFilter: string = null;
  submissionsParticipantFilter: number = null;

  @Select(ExerciseSubmissionState.listGradingGroups)
  gradingGroups$: Observable<GradingGroup[]>;
  gradingGroups: GradingGroup[];

  @Select(ExerciseSubmissionState.isFetchingGradingGroups)
  isFetchingGradingGroup$: Observable<boolean>;
  isFetchingGradingGroup: boolean;
  @Select(ExerciseSubmissionState.listExerciseSubmissions)
  exerciseSubmissions$: Observable<ExerciseSubmission[]>;
  exerciseSubmissions: ExerciseSubmission[];

  @Select(ExerciseSubmissionState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.gradingGroups$.subscribe((val) => {
      this.gradingGroups = val;
      console.log({
        gradingGroups: this.gradingGroups,
      });
    });
    this.isFetchingGradingGroup$.subscribe((val) => {
      this.isFetchingGradingGroup = val;
    });
    this.exerciseSubmissions$.subscribe((val) => {
      this.exerciseSubmissions = val;
    });
    this.updateGradingGroupByFilter();

    this.fetchGradingGroups();
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
    console.log({
      groupByOptions: this.groupByOptions,
      gradingGroups: this.gradingGroups,
    });
  }
  ngOnInit(): void {}

  openGroupedCard(card) {
    this.showGroupCards = false;
    this.exerciseSubmissionColumnFilters = {
      exerciseId: card.type == resources.EXERCISE_SUBMISSION ? card.id : null,
      chapterId: card.type == resources.CHAPTER ? card.id : null,
      courseId: card.type == resources.COURSE ? card.id : null,
      participantId: this.submissionsParticipantFilter,
      status: this.submissionStatusFilter,
    };
    this.fetchExerciseSubmissions();
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }
  constructUserName(user) {
    return constructUserFullName(user);
  }

  updateGradingGroupByFilter() {
    this.gradingGroupColumnFilters = { groupBy: this.groupBy };
  }

  fetchGradingGroups() {
    this.updateGradingGroupByFilter();
    this.showGroupCards = true;
    this.store.dispatch(
      new FetchGradingGroupsAction({
        searchParams: {
          ...defaultSearchParams,
          columnFilters: this.gradingGroupColumnFilters,
        },
      })
    );
  }

  fetchNextGradingGroups() {
    if (!this.isFetchingGradingGroup) {
      this.store.dispatch(new FetchNextGradingGroupsAction());
    }
  }

  fetchExerciseSubmissions() {
    this.store.dispatch(
      new FetchExerciseSubmissionsAction({
        searchParams: {
          ...defaultSearchParams,
          columnFilters: this.exerciseSubmissionColumnFilters,
        },
      })
    );
  }
  fetchNextExerciseSubmissions() {
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextExerciseSubmissionsAction());
    }
  }
  onScroll() {
    console.log('scrolling groups');
    if (this.showGroupCards) {
      this.fetchNextGradingGroups();
    } else {
      this.fetchNextExerciseSubmissions();
    }
  }
  createExerciseSubmission() {
    this.router.navigateByUrl(uiroutes.GRADING_FORM_ROUTE.route);
  }

  openExerciseSubmission(exerciseSubmission) {
    this.router.navigate([uiroutes.GRADING_PROFILE_ROUTE.route], {
      queryParams: { id: exerciseSubmission.id },
    });
  }
}
