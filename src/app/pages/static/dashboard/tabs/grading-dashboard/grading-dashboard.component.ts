import { Component, Inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import {
  defaultSearchParams,
  USER_ROLES_NAMES,
} from 'src/app/shared/common/constants';
import {
  autoGenOptions,
  parseDateTime,
  sortByIndex,
} from 'src/app/shared/common/functions';
import {
  CurrentMember,
  ExerciseKey,
  ExerciseQuestionTypeOptions,
  ExerciseSubmission,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { GetExerciseKeyAction } from 'src/app/shared/state/exerciseKeys/exerciseKey.actions';
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
import { ImageDisplayDialog } from 'src/app/shared/components/image-display/image-display-dialog.component';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

const groupByTypes = {
  [resources.COURSE]: resources.COURSE,
  [resources.CHAPTER]: resources.CHAPTER,
  EXERCISE: resources.EXERCISE_SUBMISSION,
};

const exerciseSubmissionStatusTypes = {
  submitted: 'SU',
  graded: 'GR',
  returned: 'RE',
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
  submissionStatusFilter: string = exerciseSubmissionStatusTypes.submitted;
  submissionsParticipantFilter: number = null;
  gradingGroupColumnFilters = {
    groupBy: this.groupBy,
    status: this.submissionStatusFilter,
  };
  params: object = {};
  questionTypes: any = ExerciseQuestionTypeOptions;
  modifiedExerciseSubmissionIds: number[] = [];
  exerciseSubmissionStatusTypes = exerciseSubmissionStatusTypes;
  exerciseSubmissionStatusOptions: MatSelectOption[] = autoGenOptions(
    exerciseSubmissionStatusTypes
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
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  rubricDatatableColumns: string[] = ['description', 'points', 'satisfied'];
  tempRemarks = {};
  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private exerciseSubmissionService: ExerciseSubmissionService
  ) {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.gradingGroups$.subscribe((val) => {
      this.gradingGroups = val;
    });
    this.isFetchingGradingGroup$.subscribe((val) => {
      this.isFetchingGradingGroup = val;
    });
    this.exerciseSubmissions$.subscribe((val) => {
      // this.resetUnsavedSubmissions();
      const existingSubmissions = this.exerciseSubmissions;
      this.exerciseSubmissions = sortByIndex(val, 'exercise.index');
      this.setupTempVariables();
      this.exerciseSubmissions = this.exerciseSubmissions.map((e) => {
        const modifiedSubmission = existingSubmissions.find(
          (sub) => sub.id == e.id
        );
        return modifiedSubmission ? modifiedSubmission : e;
      });
    });
    this.updateGradingGroupByFilter();

    this.getFiltersFromParams();
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
  }
  setupTempVariables = () => {
    this.tempRemarks = {};
    this.exerciseSubmissions.forEach((s) => {
      this.tempRemarks[s.id] = s.remarks;
    });
  };

  submissionSubtitle(submission) {
    return `${submission?.exercise?.course?.title}${
      submission?.chapter?.section?.title
        ? ' > ' + submission?.chapter?.section?.title
        : ''
    }${
      submission.exercise?.chapter?.dueDate
        ? `, due on ${parseDateTime(submission.exercise?.chapter?.dueDate)}`
        : ''
    }`;
  }
  ngOnInit(): void {
    this.getFiltersFromParams();
  }

  getFiltersFromParams() {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const statusOptions = Object.values(this.exerciseSubmissionStatusTypes);
      const groupByOptions = Object.values(groupByTypes);
      const status = params['gradingStatus'];
      const groupBy = params['groupBy'];
      this.submissionStatusFilter = statusOptions.includes(status)
        ? status
        : exerciseSubmissionStatusTypes.submitted;
      this.groupBy = groupByOptions.includes(groupBy)
        ? groupBy
        : groupByTypes.CHAPTER;
      if (this.groupBy && this.submissionStatusFilter) {
        this.fetchGradingGroups();
      }
    });
  }

  trackByFn(index: any, item: any) {
    return index;
  }
  parseDateTime(date) {
    return parseDateTime(date);
  }

  updateGradingGroupByFilter() {
    const gradingStatus = this.submissionStatusFilter;
    const groupBy = this.groupBy;
    this.gradingGroupColumnFilters = {
      groupBy: this.groupBy,
      status: gradingStatus,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { gradingStatus, groupBy },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
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
    this.fetchExerciseSubmissions();
  }
  preventLossOfUnsavedWork() {
    window.alert(
      'You have unsaved submission! Click on save all to save them before moving from this screen.'
    );
  }
  goToGroupScreen() {
    if (this.modifiedExerciseSubmissionIds.length) {
      this.preventLossOfUnsavedWork();
    } else {
      this.showGroupCards = true;
    }
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
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
    this.updateExerciseSubmissionColumnFilters();
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
    const dialogRef = this.dialog.open(ImageDisplayDialog, {
      data: {
        image,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
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

    const dialogRef = this.dialog.open(ExerciseKeyDialog, {
      data: {
        exerciseKeyRecord$: this.exerciseKeyRecord$,
        isFetchingExerciseKey$: this.isFetchingExerciseKey$,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  renderRubric(exerciseSubmission: ExerciseSubmission) {
    return JSON.parse(exerciseSubmission.exercise.rubric);
  }

  showRubric(exerciseSubmission: ExerciseSubmission) {
    const rubric = this.renderRubric(exerciseSubmission);
    return rubric?.length > 0;
  }

  renderRubricForTable(exerciseSubmission: ExerciseSubmission) {
    const rubric = this.renderRubric(exerciseSubmission);
    const tableData = rubric.map((c) => {
      c['satisfied'] =
        exerciseSubmission?.criteriaSatisfied?.includes(c.description) == true
          ? true
          : false;
      return c;
    });
    return tableData;
  }

  isCriterionSatisfied(exerciseSubmission: ExerciseSubmission, description) {
    let submission = this.exerciseSubmissions.find((s: ExerciseSubmission) => {
      return s.id == exerciseSubmission.id;
    });
    return submission.criteriaSatisfied?.includes(description);
  }

  checkCriterion(exerciseSubmission: ExerciseSubmission, description) {
    this.gradingUpdate(exerciseSubmission);
    let submission = this.exerciseSubmissions.find((s: ExerciseSubmission) => {
      return s.id == exerciseSubmission.id;
    });
    submission = Object.assign({}, submission);
    const criteriaSatisfied = submission.criteriaSatisfied
      ? submission.criteriaSatisfied
      : [];
    submission.criteriaSatisfied = criteriaSatisfied.includes(description)
      ? criteriaSatisfied.filter((desc) => desc != description)
      : criteriaSatisfied.concat([description]);
    submission.status = this.exerciseSubmissionStatusTypes.graded;
    let points = 0;
    const rubric = this.renderRubric(submission);
    rubric.forEach((c) => {
      if (submission.criteriaSatisfied.includes(c.description)) {
        points += c.points;
      }
    });
    submission.points = points;
    this.exerciseSubmissions = this.exerciseSubmissions.map((s) => {
      if (s.id == submission.id) {
        return submission;
      } else return s;
    });
  }

  gradingUpdate(exerciseSubmission: ExerciseSubmission) {
    this.modifiedExerciseSubmissionIds.push(exerciseSubmission.id);
  }

  markCorrect(exerciseSubmission) {
    this.updatePoints(exerciseSubmission, exerciseSubmission?.exercise?.points);
  }

  markIncorrect(exerciseSubmission) {
    this.updatePoints(exerciseSubmission, 0);
  }
  toggleSubmissionReturn(exerciseSubmission) {
    this.gradingUpdate(exerciseSubmission);
    let submission = this.exerciseSubmissions.find((s: ExerciseSubmission) => {
      return s.id == exerciseSubmission.id;
    });
    submission = Object.assign({}, submission);
    submission.status =
      submission.status == this.exerciseSubmissionStatusTypes.returned
        ? this.exerciseSubmissionStatusTypes.graded
        : this.exerciseSubmissionStatusTypes.returned;
    this.exerciseSubmissions = this.exerciseSubmissions.map((s) => {
      if (s.id == submission.id) {
        return submission;
      } else return s;
    });
  }
  toggleFlaggedSubmission(exerciseSubmission) {
    this.gradingUpdate(exerciseSubmission);
    let submission = this.exerciseSubmissions.find((s: ExerciseSubmission) => {
      return s.id == exerciseSubmission.id;
    });

    submission = Object.assign({}, submission);
    submission.flagged = !submission.flagged;
    this.exerciseSubmissions = this.exerciseSubmissions.map((s) => {
      if (s.id == submission.id) {
        return submission;
      } else return s;
    });
  }
  remarksRequired(exerciseSubmission) {
    return this.partialScore(exerciseSubmission) || exerciseSubmission.flagged;
  }
  partialScore(exerciseSubmission) {
    return (
      exerciseSubmission.points > 0 &&
      exerciseSubmission.points < exerciseSubmission.exercise.points
    );
  }
  updatePoints(exerciseSubmission, points) {
    this.gradingUpdate(exerciseSubmission);
    let submission = this.exerciseSubmissions.find((s: ExerciseSubmission) => {
      return s.id == exerciseSubmission.id;
    });

    submission = Object.assign({}, submission);
    submission.points = points;
    submission.status = this.exerciseSubmissionStatusTypes.graded;
    this.exerciseSubmissions = this.exerciseSubmissions.map((s) => {
      if (s.id == submission.id) {
        return submission;
      } else return s;
    });
  }
  changePoints(event, exerciseSubmission) {
    event.preventDefault();

    const points =
      exerciseSubmission.exercise.points >= event.target.value
        ? event.target.value
        : exerciseSubmission.exercise.points;
    event.target.value = points;
    this.updatePoints(exerciseSubmission, points);
  }

  updateRemarks(exerciseSubmission) {
    this.gradingUpdate(exerciseSubmission);
    let submission = this.exerciseSubmissions.find((s: ExerciseSubmission) => {
      return s.id == exerciseSubmission.id;
    });

    submission = Object.assign({}, submission);
    submission.remarks = this.tempRemarks[exerciseSubmission.id];
    this.exerciseSubmissions = this.exerciseSubmissions.map((s) => {
      if (s.id == submission.id) {
        return submission;
      } else return s;
    });
  }

  showSaveButton() {
    return this.modifiedExerciseSubmissionIds.length > 0;
  }

  resetUnsavedSubmissions() {
    this.modifiedExerciseSubmissionIds = [];
    this.tempRemarks = {};
  }

  showBulkAutoOption() {
    return (
      this.currentMember.role.name == USER_ROLES_NAMES.SUPER_ADMIN &&
      this.authorizeResourceMethod(this.resourceActions.UPDATE)
    );
  }

  initiateBulkAutoGrading() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm bulk auto grade?',
      message: `If you don't know what this is, please press cancel! Are you sure you want to automatically grade all eligible submissions? Make sure to backup database before confirming!"`,
      confirmButtonText: 'Initiate Automatic Grading',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.store.dispatch(
          new CreateUpdateExerciseSubmissionsAction({
            exerciseSubmissions: [],
            grading: true,
            bulkauto: true,
          })
        );
      }
    });
  }

  submitExerciseSubmissionForm() {
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
        grading: true,
      })
    );
  }
}

@Component({
  selector: 'exercise-key-dialog',
  templateUrl: './exercise-key-dialog/exercise-key-dialog.html',
  styleUrls: [
    './exercise-key-dialog/exercise-key-dialog.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class ExerciseKeyDialog {
  exerciseKey: ExerciseKey;
  isFetchingExerciseKey: boolean = false;
  chapterRoute = '';
  questionTypes: any = ExerciseQuestionTypeOptions;
  constructor(
    public dialogRef: MatDialogRef<ExerciseKeyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    data.exerciseKeyRecord$.subscribe((val) => {
      this.exerciseKey = val;
      this.chapterRoute = `/${uiroutes.CHAPTER_PROFILE_ROUTE.route}?id=${this.exerciseKey.exercise?.chapter?.id}`;
    });
    data.isFetchingExerciseKey$.subscribe((val) => {
      this.isFetchingExerciseKey = val;
    });
  }
  trackByFn(index: any, item: any) {
    return index;
  }
}
