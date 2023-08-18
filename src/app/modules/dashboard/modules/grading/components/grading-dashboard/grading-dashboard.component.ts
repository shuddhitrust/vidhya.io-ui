import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import {
  defaultSearchParams,
  USER_ROLES_NAMES,
} from 'src/app/shared/common/constants';
import {
  autoGenOptions,
  convertKeyToLabel,
  ExerciseTitle,
  getKeyForValue,
  parseDateTime,
  sortByIndex,
} from 'src/app/shared/common/functions';
import {
  Criterion,
  CriterionResponse,
  CurrentMember,
  Exercise,
  ExerciseKey,
  ExerciseQuestionTypeOptions,
  ExerciseRubric,
  ExerciseSubmission,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { GetExerciseKeyAction } from '../../../course/state/exerciseKeys/exerciseKey.actions';
import { ExerciseKeyState } from '../../../course/state/exerciseKeys/exerciseKey.state';
import {
  CreateUpdateExerciseSubmissionsAction,
  FetchExerciseSubmissionsAction,
  FetchGradingGroupsAction,
  FetchNextExerciseSubmissionsAction,
  FetchNextGradingGroupsAction,
  ResetSubmissionHistory,
  ShowSubmissionHistory,
} from '../../../course/state/exerciseSubmissions/exerciseSubmission.actions';
import { ImageDisplayDialog } from 'src/app/shared/components/image-display/image-display-dialog.component';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import {
  emptyGradingGroup,
  GradingGroup,
} from '../../../course/state/exerciseSubmissions/exerciseSubmission.model';
import { ExerciseSubmissionState } from '../../../course/state/exerciseSubmissions/exerciseSubmission.state';
import { ExerciseSubmissionService } from '../../../course/state/exerciseSubmissions/exerciseSubmission.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { GRADING } from 'src/app/modules/dashboard/dashboard.component';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { ClearServerCacheAction } from 'src/app/modules/dashboard/state/dashboard.actions';
import { takeUntil } from 'rxjs/operators';

/**
 * URL Param Labels for filters
 */
const URL_PARAMS = {
  gradingStatus: 'gradingStatus',
  groupBy: 'groupBy',
  submission: 'submission',
  participant: 'participant',
  flagged: 'flagged',
  searchQuery: 'searchQuery',
};

/**
 * If you wish to change how it shows in the UI, just change the key.
 * Never change the value unless it changes in the db
 */
const groupByTypes = {
  [resources.COURSE]: resources.COURSE,
  [resources.CHAPTER]: resources.CHAPTER,
  EXERCISE: resources.EXERCISE_SUBMISSION,
};
/**
 * If you wish to change how it shows in the UI, just change the key.
 * Never change the value unless it changes in the db
 */
const exerciseSubmissionStatusTypes = {
  ungraded: 'SU',
  graded: 'GR',
  returned: 'RE',
};

@Component({
  selector: 'app-grading-dashboard',
  templateUrl: './grading-dashboard.component.html',
  styleUrls: [
    './grading-dashboard.component.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class GradingDashboardComponent implements OnInit, OnDestroy {
  resource: string = resources.GRADING;
  resourceActions = RESOURCE_ACTIONS;
  groupByOptions: MatSelectOption[] = autoGenOptions(groupByTypes);
  groupByFilter: string = resources.EXERCISE_SUBMISSION;
  exerciseSubmissionColumnFilters = {};
  showGroupCards: boolean = true;
  currentCard: GradingGroup = emptyGradingGroup;
  flaggedFilter: boolean = null;
  submissionStatusFilter: string = exerciseSubmissionStatusTypes.ungraded;
  submissionsParticipantFilter: number = null;
  searchQueryFilter: string = null;
  lastUsedSearchQuery: string = null;
  submissionFilter: number = null;
  gradingGroupColumnFilters = {
    groupBy: this.groupByFilter,
    status: this.submissionStatusFilter,
    flagged: this.flaggedFilter,
    searchQuery: this.searchQueryFilter,
    submission: this.submissionFilter,
    participant: this.submissionsParticipantFilter,
  };
  params: object = {};
  questionTypes: any = ExerciseQuestionTypeOptions;
  modifiedExerciseSubmissionIds: number[] = [];
  exerciseSubmissionStatusTypes = exerciseSubmissionStatusTypes;
  exerciseSubmissionStatusOptions: MatSelectOption[] = autoGenOptions(
    exerciseSubmissionStatusTypes
  );
  exerciseSubmissionFlaggedOptions: MatSelectOption[] = autoGenOptions({
    true: true,
    false: false,
    both: null,
  });

  @Select(ExerciseSubmissionState.listGradingGroups)
  gradingGroups$: Observable<GradingGroup[]>;
  gradingGroups: GradingGroup[];

  @Select(ExerciseSubmissionState.isFetchingGradingGroups)
  isFetchingGradingGroup$: Observable<boolean>;
  isFetchingGradingGroup: boolean;
  @Select(ExerciseSubmissionState.listExerciseSubmissions)
  exerciseSubmissions$: Observable<ExerciseSubmission[]>;
  exerciseSubmissions: ExerciseSubmission[] = [];

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
  rubricDatatableColumns: string[] = ['description', 'points', 'remarks'];
  tempRemarks = {};
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService,
    public clipboard: Clipboard,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private exerciseSubmissionService: ExerciseSubmissionService
  ) {
    this.currentMember$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.currentMember = val;
    });
    this.gradingGroups$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.gradingGroups = val;
      this.currentCard = emptyGradingGroup;
    });
    this.isFetchingGradingGroup$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isFetchingGradingGroup = val;
    });
    this.exerciseSubmissions$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      const existingSubmissions = this.exerciseSubmissions; // This stores any unsaved existing submissions in a temp variable
      this.exerciseSubmissions = sortByIndex(val, 'exercise.index'); // Sorting the submissions
      this.exerciseSubmissions = this.exerciseSubmissions.map((e) => {
        // Checking if unsaved submissions are part of incoming submissions
        const modifiedSubmission = existingSubmissions?.find(
          (sub) => sub.id == e.id
        );
        // Overwriting the incoming submission with the latest unsaved work
        return modifiedSubmission ? modifiedSubmission : e;
      });
      this.setupTempVariables();
    });
    this.isFetching$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isFetching = val;
    });
  }
  keyToLabel(key) {
    return convertKeyToLabel(key);
  }
  setupTempVariables = () => {
    this.exerciseSubmissions.forEach((s) => {
      this.tempRemarks[s.id] = s.remarks;
    });
  };

  submissionSubtitle(submission) {
    const courseTitle = submission?.exercise?.course?.title;
    const sectionTitle = submission?.exercise?.chapter?.section?.title
      ? ' > ' + submission?.exercise?.chapter?.section?.title
      : '';
    const chapterTitle = submission?.exercise?.chapter?.title
      ? ' > ' + submission?.exercise?.chapter?.title
      : '';
    const dueDate = submission.exercise?.chapter?.dueDate
      ? `, due on ${parseDateTime(submission.exercise?.chapter?.dueDate)}`
      : '';
    return `${courseTitle}${sectionTitle}${chapterTitle}${dueDate}`;
  }
  ngOnInit(): void {
    this.getFiltersFromParams();
  }

  getFiltersFromParams() {
    this.route.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      this.params = params;
      this.submissionFilter = params[URL_PARAMS.submission];
      if (this.submissionFilter) {
        this.fetchExerciseSubmissions();
      } else {
        if (params[URL_PARAMS.flagged] == 'true') {
          this.flaggedFilter = true;
        }
        if (params[URL_PARAMS.flagged] == 'false') {
          this.flaggedFilter = false;
        }
        this.searchQueryFilter = params[URL_PARAMS.searchQuery];
        this.submissionsParticipantFilter = params[URL_PARAMS.participant];
        const statusOptions = Object.values(this.exerciseSubmissionStatusTypes);
        const groupByOptions = Object.values(groupByTypes);
        const status = params[URL_PARAMS.gradingStatus];
        const groupBy = params[URL_PARAMS.groupBy];
        this.submissionStatusFilter = statusOptions.includes(status)
          ? status
          : exerciseSubmissionStatusTypes.ungraded;
        this.groupByFilter = groupByOptions.includes(groupBy)
          ? groupBy
          : groupByTypes.CHAPTER;
        if (this.groupByFilter && this.submissionStatusFilter) {
          this.fetchGradingGroups();
        }
      }
    });
  }

  trackByFn(index: any, item: any) {
    return index;
  }
  parseDateTime(date) {
    return parseDateTime(date);
  }

  submissionStatusFilterChanged() {
    // If we are showing the graded submissions, we need to inform the user that the results only show records from the past 60 days
    if (
      this.submissionStatusFilter == exerciseSubmissionStatusTypes.graded &&
      !this.searchQueryFilter
    ) {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Graded submissions shown here are only from the past 60 days. To view older graded submissions, use a specific search query.',
          action: 'warning',
          autoClose: false,
        })
      );
    }
    this.fetchGradingGroups();
  }

  updateGradingGroupByFilter() {
    const submission = this.submissionFilter;
    const status = this.submissionStatusFilter;
    const flagged = this.flaggedFilter;
    const groupBy = this.groupByFilter;
    const searchQuery = this.searchQueryFilter;
    const participant = this.submissionsParticipantFilter;
    this.gradingGroupColumnFilters = {
      groupBy,
      status,
      flagged,
      searchQuery,
      submission,
      participant,
    };
    let queryParams = {
      [URL_PARAMS.flagged]: flagged,
      [URL_PARAMS.gradingStatus]: status,
      [URL_PARAMS.groupBy]: groupBy,
      [URL_PARAMS.searchQuery]: searchQuery,
      [URL_PARAMS.submission]: submission,
      [URL_PARAMS.participant]: participant,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  updateExerciseSubmissionColumnFilters() {
    this.exerciseSubmissionColumnFilters = {
      ...this.exerciseSubmissionColumnFilters,
      status: this.submissionStatusFilter,
      participantId: this.submissionsParticipantFilter,
      submissionId: this.submissionFilter,
      flagged: this.flaggedFilter,
      searchQuery: this.searchQueryFilter,
    };
  }

  openGroupedCard(card) {
    this.currentCard = card;
    this.exerciseSubmissionColumnFilters = {
      exerciseId: card.type == resources.EXERCISE_SUBMISSION ? card.id : null,
      chapterId: card.type == resources.CHAPTER ? card.id : null,
      courseId: card.type == resources.COURSE ? card.id : null,
      participantId: this.submissionsParticipantFilter,
      status: this.submissionStatusFilter,
      flagged: this.flaggedFilter,
      searchQuery: this.searchQueryFilter,
    };
    this.fetchExerciseSubmissions();
  }
  preventLossOfUnsavedWork() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Lose unsaved work?',
      message: `This could cause all unsaved work to be lost. Continue? `,
      confirmButtonText: 'Yes',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result == true) {
        this.showGroupCards = true;
      }
    });
  }
  goToGroupScreen() {
    if (this.modifiedExerciseSubmissionIds.length) {
      this.preventLossOfUnsavedWork();
    } else {
      this.showGroupCards = true;
      this.submissionFilter = null;
      this.updateGradingGroupByFilter();
      this.getFiltersFromParams();
    }
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  clearSearchQueryFilter() {
    this.searchQueryFilter = null;
    this.fetchGradingGroups();
  }

  pageTitle() {
    // Initial text for the title...
    let title = '<span class="page-title">';
    // text describing the currently applied submission status filter...
    const statusTypeText = getKeyForValue(
      exerciseSubmissionStatusTypes,
      this.submissionStatusFilter,
      false
    );

    // Determining flagged status...
    let flaggedStatus = this.flaggedFilter ? ' & flagged ' : '';
    flaggedStatus =
      this.flaggedFilter == false ? ' & non-flagged ' : flaggedStatus;

    // text describing the item type...
    let itemTypeText = getKeyForValue(groupByTypes, this.groupByFilter);
    itemTypeText = itemTypeText ? itemTypeText + 's' : 'results';
    // text describing the search filter...
    const searchDescription = this.lastUsedSearchQuery
      ? ` containing "${this.lastUsedSearchQuery}"`
      : '';
    // Altering the item description depending on whether we're showing the grouping cards or submissions
    const items = this.showGroupCards
      ? `${itemTypeText} with ${statusTypeText} `
      : `${statusTypeText} `;
    // constructing the title using all the separate parts
    if (this.showGroupCards) {
      title += `${items}${flaggedStatus}submissions`;
    } else {
      title += `${
        this.currentCard?.title
      } <span class="group-type-subtitle">(${this.keyToLabel(
        this.currentCard?.type
      )})</span>`;
    }
    const finalTitle =
      title +
      `<span class="title-search-description">${searchDescription}</span>` +
      '</span>';
    const doNotShowTitle = !this.showGroupCards && !this.currentCard.title; // When we are showing submissions directly, like in the case of having a submission filter from the URL params.
    return doNotShowTitle ? '' : finalTitle;
  }

  exerciseTitle(exercise: Exercise): string {
    return `${ExerciseTitle(exercise.chapter, exercise)} ${exercise.prompt}`;
  }

  copyShareURL(exerciseSubmission) {
    const parsedUrl = new URL(window.location.href);
    const baseUrl = parsedUrl.origin;
    const url = `${baseUrl}/${uiroutes.DASHBOARD_ROUTE.route}?tab=${GRADING}&${URL_PARAMS.submission}=${exerciseSubmission.id}`;
    this.clipboard.copy(url);
    this.store.dispatch(
      new ShowNotificationAction({
        message: 'Copied the link to this submission to your clipboard!',
        action: 'success',
      })
    );
  }

  fetchGradingGroups() {
    this.submissionFilter = null; // Resetting the submission filter
    this.updateGradingGroupByFilter();
    this.showGroupCards = true;
    this.lastUsedSearchQuery = this.searchQueryFilter;
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
    this.showGroupCards = false;
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

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }

  openExerciseSubmission(exerciseSubmission) {
    this.router.navigate([uiroutes.GRADING_PROFILE_ROUTE.route], {
      queryParams: { id: exerciseSubmission.id },
    });
  }

  showAnswerKey(exerciseSubmission) {
    if (
      this.auth.authorizeResource(resources.EXERCISE_KEY, RESOURCE_ACTIONS.GET)
    ) {
      this.store.dispatch(
        new GetExerciseKeyAction({
          exerciseId: exerciseSubmission?.exercise.id,
        })
      );

      const dialogRef = this.dialog.open(ExerciseKeyDialog, {
        data: {
          exerciseKeyRecord$: this.exerciseKeyRecord$,
          isFetchingExerciseKey$: this.isFetchingExerciseKey$,
        },
      });

      dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
    }
  }

  showHistory(exerciseSubmission) {
    this.store.dispatch(
      new ShowSubmissionHistory({
        exerciseId: exerciseSubmission?.exercise.id,
        participantId: exerciseSubmission?.participant?.id,
      })
    );

    const dialogRef = this.dialog.open(SubmissionHistoryDialog, {
      data: {},
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }

  showRubric(exerciseSubmission: ExerciseSubmission) {
    const rubric: ExerciseRubric = exerciseSubmission?.exercise?.rubric;
    return (
      rubric?.length > 0 &&
      this.authorizeResourceMethod(RESOURCE_ACTIONS.UPDATE)
    );
  }

  criterionZeroButtonColor(criterionResponse: CriterionResponse): string {
    let color = 'secondary';
    if (criterionResponse.score == 0) {
      color = 'accent';
    }
    return color;
  }
  criterionFullPointsButtonColor(criterionResponse: CriterionResponse): string {
    return criterionResponse.score == criterionResponse?.criterion?.points
      ? 'primary'
      : 'secondary';
  }

  markCriterionIncorrect(submission, criterionResponse) {
    // Updating it with zero points
    this.updateCriterionPoints(null, submission, criterionResponse, 0);
  }

  markCriterionCorrect(submission, criterionResponse) {
    // Updating it with full points
    this.updateCriterionPoints(
      null,
      submission,
      criterionResponse,
      criterionResponse?.criterion?.points
    );
  }

  updateCriterionPoints(
    event,
    exerciseSubmission: ExerciseSubmission,
    criterionResponse: CriterionResponse,
    points: number = 0
  ) {
    if (event) {
      event.preventDefault();
      points = event.target.value;
    }
    this.gradingUpdate(exerciseSubmission);
    let submission = this.exerciseSubmissions.find((s: ExerciseSubmission) => {
      return s.id == exerciseSubmission.id;
    });

    submission = Object.assign({}, submission);

    let score =
      criterionResponse.criterion.points >= points
        ? points
        : criterionResponse.criterion.points;

    score = score ? score : 0;

    let newRubric = Object.assign([], submission.rubric);
    newRubric = newRubric.map((c) => {
      if (c.id == criterionResponse.id) {
        let newC = Object.assign({}, c);
        newC.score = score;
        return newC;
      } else return c;
    });
    let totalPoints = 0;
    newRubric.forEach((c) => {
      totalPoints += parseInt(c.score);
    });
    submission.rubric = newRubric;
    this.exerciseSubmissions = this.exerciseSubmissions.map((s) => {
      if (s.id == submission.id) {
        return submission;
      } else return s;
    });
    this.updatePoints(submission, totalPoints);
  }

  openCriterionResponseRemarks(
    exerciseSubmission: ExerciseSubmission,
    criterionResponse: CriterionResponse
  ) {
    const dialogRef = this.dialog.open(CriterionRemarkInputDialog, {
      data: {
        exerciseSubmission,
        criterionResponse,
      },
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result.remarksUpdated == true) {
        criterionResponse = Object.assign({
          ...criterionResponse,
          remarks: result.newRemarks,
        });
        this.updateCriterionResponseRemarks(
          exerciseSubmission,
          criterionResponse
        );
      }
    });
  }

  updateCriterionResponseRemarks(exerciseSubmission, criterionResponse) {
    this.gradingUpdate(exerciseSubmission);
    let submission = this.exerciseSubmissions.find((s: ExerciseSubmission) => {
      return s.id == exerciseSubmission.id;
    });

    submission = Object.assign({}, submission);

    let newRubric = Object.assign([], submission.rubric);
    newRubric = newRubric.map((c) => {
      if (c.id == criterionResponse.id) {
        let newC = Object.assign({}, c);
        newC.remarks = criterionResponse.remarks;
        newC.remarker = {
          id: this.currentMember.id,
          name: this.currentMember.name,
        };
        return newC;
      } else return c;
    });
    submission.rubric = newRubric;
    this.exerciseSubmissions = this.exerciseSubmissions.map((s) => {
      if (s.id == submission.id) {
        return submission;
      } else return s;
    });
  }

  partialCriterionScore(criterionResponse: CriterionResponse): boolean {
    return criterionResponse.score < criterionResponse.criterion.points;
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
  returnButtonColor(exerciseSubmission) {
    return exerciseSubmission.status == exerciseSubmissionStatusTypes.returned
      ? 'warn'
      : 'secondary';
  }
  zeroButtonColor(exerciseSubmission) {
    let color = 'secondary';
    if (
      exerciseSubmission.points == 0 &&
      exerciseSubmission.status != this.exerciseSubmissionStatusTypes.ungraded
    ) {
      color = 'accent';
    }
    return color;
  }
  fullPointsButtonColor(exerciseSubmission) {
    return exerciseSubmission.points == exerciseSubmission?.exercise?.points
      ? 'primary'
      : 'secondary';
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
    submission.status =
      submission.status == this.exerciseSubmissionStatusTypes.ungraded
        ? this.exerciseSubmissionStatusTypes.graded
        : submission.status;
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

  showBulkAction() {
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

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
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

  clearServerSideCache() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm clearing of server cache?',
      message: `If you don't know what this is, please press cancel! Are you sure you want to clear all cache stored in the server?"`,
      confirmButtonText: 'Clear server cache',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result == true) {
        this.store.dispatch(new ClearServerCacheAction());
      }
    });
  }

  submitExerciseSubmissionForm() {
    let allowSubmission = true;
    const submissionsToSave = this.exerciseSubmissions.filter((s) =>
      this.modifiedExerciseSubmissionIds.includes(s.id)
    );
    // Checking if all the submissions that need a remarks field have it
    submissionsToSave.forEach((s) => {
      if (this.remarksRequired(s) && !s.remarks) {
        allowSubmission = false;
        this.store.dispatch(
          new ShowNotificationAction({
            message:
              "Make sure you've added remarks wherever required and try again",
            action: 'error',
          })
        );
      }
    });
    if (allowSubmission) {
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

@Component({
  selector: 'exercise-key-dialog',
  templateUrl: './exercise-key-dialog/exercise-key-dialog.html',
  styleUrls: [
    './exercise-key-dialog/exercise-key-dialog.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
})
export class ExerciseKeyDialog {
  exerciseKey: ExerciseKey;
  isFetchingExerciseKey: boolean = false;
  chapterRoute = '';
  questionTypes: any = ExerciseQuestionTypeOptions;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ExerciseKeyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    data.exerciseKeyRecord$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.exerciseKey = val;
      this.chapterRoute = `/${uiroutes.CHAPTER_PROFILE_ROUTE.route}?id=${this.exerciseKey.exercise?.chapter?.id}&courseId=${this.exerciseKey?.exercise?.course?.id}`;
    });
    data.isFetchingExerciseKey$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isFetchingExerciseKey = val;
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  showExpandedImage(image) {
    const dialogRef = this.dialog.open(ImageDisplayDialog, {
      data: {
        image,
      },
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }
  trackByFn(index: any, item: any) {
    return index;
  }
}

@Component({
  selector: 'criterion-remark-dialog',
  templateUrl: './criterion-remark-dialog/criterion-remark-dialog.html',
  styleUrls: [
    './criterion-remark-dialog/criterion-remark-dialog.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
})
export class CriterionRemarkInputDialog {
  criterionResponse: CriterionResponse;
  newRemarks: string;
  remarksUpdated: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialogRef: MatDialogRef<CriterionRemarkInputDialog>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.criterionResponse = data.criterionResponse;
    this.newRemarks = this.criterionResponse.remarks;
    this.dialogRef.disableClose = true; //disable default close operation
    this.dialogRef.backdropClick()
    .pipe(takeUntil(this.destroy$))
    .subscribe((result) => {
      this.discardChangesCloseConfirmation();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  discardChangesCloseConfirmation() {
    if (this.remarksUpdated) {
      const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
        title: 'Close dialog without saving changes?',
        message: `This could cause all unsaved work to be lost. Continue? `,
        confirmButtonText: 'Yes',
        denyButtonText: 'Cancel',
      };
      const dialogRef = this.dialog.open(MasterConfirmationDialog, {
        data: masterDialogConfirmationObject,
      });

      dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
        if (result == true) {
          this.discardChangesClose();
        }
      });
    } else {
      this.discardChangesClose();
    }
  }
  saveChangesCloseConfirmation() {
    if (this.remarksUpdated) {
      const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
        title: 'Save all changes and close dialog?',
        message: `This will overwrite any existing remarks. Continue?`,
        confirmButtonText: 'Yes',
        denyButtonText: 'Cancel',
      };
      const dialogRef = this.dialog.open(MasterConfirmationDialog, {
        data: masterDialogConfirmationObject,
      });

      dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
        if (result == true) {
          this.saveCloseDialog();
        }
      });
    } else {
      this.discardChangesClose();
    }
  }
  discardChangesClose() {
    this.dialogRef.close({
      remarksUpdated: false,
      newRemarks: null,
    });
  }
  saveCloseDialog() {
    this.dialogRef.close({
      remarksUpdated: this.remarksUpdated,
      newRemarks: this.newRemarks,
    });
  }

  updateRemarks() {
    this.remarksUpdated = true;
  }
}

@Component({
  selector: 'submission-history-dialog',
  templateUrl: './submission-history-dialog/submission-history-dialog.html',
  styleUrls: [
    './submission-history-dialog/submission-history-dialog.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
})
export class SubmissionHistoryDialog implements OnDestroy {
  history: any[];
  isFetchingSubmissionHistory: boolean = false;
  questionTypes: any = ExerciseQuestionTypeOptions;
  @Select(ExerciseSubmissionState.isFetchingSubmissionHistory)
  isFetchingSubmissionHistory$: Observable<boolean>;

  @Select(ExerciseSubmissionState.submissionHistory)
  submissionHistory$: Observable<ExerciseSubmission[]>;
  rubricDatatableColumns: string[] = ['description', 'points', 'remarks'];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ExerciseKeyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.submissionHistory$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.history = val;
    });
    this.isFetchingSubmissionHistory$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isFetchingSubmissionHistory = val;
    });
  }

  showRemarks(criterion: CriterionResponse) {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: `Remarks by ${criterion?.remarker?.name}`,
      message: `${criterion.remarks}`,
      confirmButtonText: '',
      denyButtonText: '',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }
  trackByFn(index: any, item: any) {
    return index;
  }
  parseDateTime(date) {
    return parseDateTime(date);
  }

  renderGradingRemarks(exerciseSubmission) {
    return `Remarks ${
      exerciseSubmission.grader?.name
        ? ` by
                  ${exerciseSubmission.grader?.name}`
        : ''
    }`;
  }
  showExpandedImage(image) {
    const dialogRef = this.dialog.open(ImageDisplayDialog, {
      data: {
        image,
      },
    });
  }

  keyToLabel(key) {
    const exerciseSubmissionStatusTypes = {
      submitted: 'SU',
      graded: 'GR',
      returned: 'RE',
    };
    key = getKeyForValue(exerciseSubmissionStatusTypes, key, false);
    return convertKeyToLabel(key);
  }

  ngOnDestroy() {
    this.store.dispatch(new ResetSubmissionHistory());
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
