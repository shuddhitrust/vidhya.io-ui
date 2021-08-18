import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  autoGenOptions,
  constructUserFullName,
  parseDateTime,
} from 'src/app/shared/common/functions';
import {
  ExerciseKey,
  ExerciseQuestionTypeOptions,
  ExerciseSubmission,
  ExerciseSubmissionStatusOptions,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchExerciseKeysAction,
  GetExerciseKeyAction,
} from 'src/app/shared/state/exerciseKeys/exerciseKey.actions';
import { ExerciseKeyState } from 'src/app/shared/state/exerciseKeys/exerciseKey.state';
import {
  CreateUpdateExerciseSubmissionsAction,
  FetchExerciseSubmissionsAction,
  FetchGradingGroupsAction,
  FetchNextExerciseSubmissionsAction,
  FetchNextGradingGroupsAction,
} from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.actions';
import {
  emptyExerciseSubmissionFormRecord,
  GradingGroup,
} from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.model';
import { ExerciseSubmissionService } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.service';
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
  resource: string = resources.GRADING;
  resourceActions = RESOURCE_ACTIONS;
  groupByOptions: MatSelectOption[] = autoGenOptions(groupByTypes);
  groupBy: string = resources.EXERCISE_SUBMISSION;
  exerciseSubmissionColumnFilters = {};
  showGroupCards: boolean = true;
  submissionStatusFilter: string = ExerciseSubmissionStatusOptions.submitted;
  submissionsParticipantFilter: number = null;
  gradingGroupColumnFilters = {
    groupBy: this.groupBy,
    status: this.submissionStatusFilter,
  };
  questionTypes: any = ExerciseQuestionTypeOptions;
  showSaveButton: boolean = false;
  modifiedExerciseSubmissionIds: number[] = [];
  exerciseSubmissionStatusTypes = ExerciseSubmissionStatusOptions;
  exerciseSubmissionStatusOptions: MatSelectOption[] = autoGenOptions(
    ExerciseSubmissionStatusOptions
  );

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

  @Select(ExerciseKeyState.isFetching)
  isFetchingExerciseKey$: Observable<boolean>;

  @Select(ExerciseKeyState.getExerciseKeyFormRecord)
  exerciseKeyRecord$: Observable<ExerciseKey>;

  @Select(ExerciseSubmissionState.formSubmitting)
  isSubmittingForm$: Observable<boolean>;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService,
    public dialog: MatDialog,
    private exerciseSubmissionService: ExerciseSubmissionService
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

  parseDateTime(date) {
    return parseDateTime(date);
  }

  updateGradingGroupByFilter() {
    this.gradingGroupColumnFilters = {
      groupBy: this.groupBy,
      status: this.submissionStatusFilter,
    };
  }

  updateExerciseSubmissionColumnFilters() {
    this.exerciseSubmissionColumnFilters = {
      ...this.exerciseSubmissionColumnFilters,
      status: this.submissionStatusFilter,
      participantId: this.submissionsParticipantFilter,
    };
  }

  openGroupedCard(card) {
    this.showGroupCards = false;
    this.exerciseSubmissionColumnFilters = {
      exerciseId: card.type == resources.EXERCISE_SUBMISSION ? card.id : null,
      chapterId: card.type == resources.CHAPTER ? card.id : null,
      courseId: card.type == resources.COURSE ? card.id : null,
      participantId: this.submissionsParticipantFilter,
      status: this.submissionStatusFilter,
    };
    console.log('from openGroupedCard => columnFilters', {
      card,
      columnFilters: this.exerciseSubmissionColumnFilters,
    });
    this.fetchExerciseSubmissions();
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }
  constructUserName(user) {
    return constructUserFullName(user);
  }

  fetchGradingGroups() {
    console.log('calling fetchGradingGroups', { groupBy: this.groupBy });
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
    this.updateExerciseSubmissionColumnFilters();
    console.log('exercise submissions columnFilter from component => ', {
      columnFilters: this.exerciseSubmissionColumnFilters,
    });
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
  showExpandedImage(image) {
    console.log('image ', { image });
  }

  openExerciseSubmission(exerciseSubmission) {
    this.router.navigate([uiroutes.GRADING_PROFILE_ROUTE.route], {
      queryParams: { id: exerciseSubmission.id },
    });
  }

  showAnswerKey(exerciseSubmission) {
    this.store.dispatch(
      new GetExerciseKeyAction({ exerciseId: exerciseSubmission?.exercise.id })
    );
    console.log('from showAnswerKey', { exerciseSubmission });
    const dialogRef = this.dialog.open(ExercicseKeyDialog, {
      data: {
        exerciseKeyRecord$: this.exerciseKeyRecord$,
        isFetchingExerciseKey$: this.isFetchingExerciseKey$,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('close dialog result for exercise => ', result);
    });
  }

  gradingUpdate(exerciseSubmission: ExerciseSubmission) {
    this.showSaveButton = true;
    this.modifiedExerciseSubmissionIds.push(exerciseSubmission.id);
  }

  markCorrect(exerciseSubmission) {
    console.log('from markCorrect', { exerciseSubmission });
    this.updatePoints(exerciseSubmission, exerciseSubmission?.exercise?.points);
  }

  markIncorrect(exerciseSubmission) {
    console.log('from markIncorrect', { exerciseSubmission });
    this.updatePoints(exerciseSubmission, 0);
  }
  updatePoints(exerciseSubmission, points) {
    console.log('from updatePoints', {
      exerciseSubmission,
      exerciseSubmissions: this.exerciseSubmissions,
    });
    this.gradingUpdate(exerciseSubmission);
    let submission = this.exerciseSubmissions.find((s: ExerciseSubmission) => {
      return s.id == exerciseSubmission.id;
    });
    console.log('submission before update', { submission });

    submission = Object.assign({}, submission);
    submission.points = points;
    submission.status = this.exerciseSubmissionStatusTypes.graded;
    this.exerciseSubmissions = this.exerciseSubmissions.map((s) => {
      if (s.id == submission.id) {
        return submission;
      } else return s;
    });
    console.log('submission after update', { submission });
  }
  changePoints(event, exerciseSubmission) {
    const points = event.target.value + event.key;
    this.updatePoints(exerciseSubmission, points);
  }

  submitExerciseSubmissionForm() {
    console.log('Submitting exerciseSubmissions', {
      exerciseSubmissions: this.exerciseSubmissions,
    });
    const submissionsToSave = this.exerciseSubmissions.filter((s) =>
      this.modifiedExerciseSubmissionIds.includes(s.id)
    );
    const sanitizedSubmissions =
      this.exerciseSubmissionService.sanitizeExerciseSubmissions(
        submissionsToSave
      );
    this.store.dispatch(
      new CreateUpdateExerciseSubmissionsAction({
        exerciseSubmissions: sanitizedSubmissions,
      })
    );
  }
}

@Component({
  selector: 'exercise-key-dialog',
  templateUrl: './exercise-key-dialog.html',
  styleUrls: [
    './exercise-key-dialog.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class ExercicseKeyDialog {
  exerciseKey: ExerciseKey;
  isFetchingExerciseKey: boolean = false;
  questionTypes: any = ExerciseQuestionTypeOptions;
  constructor(
    public dialogRef: MatDialogRef<ExercicseKeyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    data.exerciseKeyRecord$.subscribe((val) => {
      this.exerciseKey = val;
    });
    data.isFetchingExerciseKey$.subscribe((val) => {
      this.isFetchingExerciseKey = val;
    });
  }
  trackByFn(index: any, item: any) {
    return index;
  }
}
