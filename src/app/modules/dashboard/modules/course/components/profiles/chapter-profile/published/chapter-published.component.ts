import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteChapterAction,
  GetChapterAction,
  ResetChapterFormAction,
} from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.actions';
import { ChapterState } from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.state';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  Chapter,
  ChapterStatusOptions,
  CourseStatusOptions,
  Exercise,
  ExerciseQuestionTypeOptions,
  ExerciseSubmission,
  ExerciseSubmissionStatusOptions,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  autoGenOptions,
  ChapterSubtitle,
  ChapterTitle,
  ExerciseTitle,
  getOptionLabel,
  parseDateTime,
  sortByIndex,
  SubmissionPoints,
  SubmissionStatus,
} from 'src/app/shared/common/functions';
import { FormGroupDirective } from '@angular/forms';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { UploadService } from 'src/app/shared/api/upload.service';
import {
  DragDropComponent,
  DragDropInput,
} from 'src/app/shared/components/drag-drop/drag-drop.component';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ImageDisplayDialog } from 'src/app/shared/components/image-display/image-display-dialog.component';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { ExerciseState } from '../../../../state/exercises/exercise.state';
import { ExerciseSubmissionState } from '../../../../state/exerciseSubmissions/exerciseSubmission.state';
import { ExerciseSubmissionService } from '../../../../state/exerciseSubmissions/exerciseSubmission.service';
import { emptyExerciseSubmissionFormRecord } from '../../../../state/exerciseSubmissions/exerciseSubmission.model';
import {
  DeleteExerciseAction,
  FetchExercisesAction,
  ReorderExercisesAction,
  ResetExerciseStateAction,
} from '../../../../state/exercises/exercise.actions';
import { CreateUpdateExerciseSubmissionsAction } from '../../../../state/exerciseSubmissions/exerciseSubmission.actions';

const startingExerciseFormOptions = ['', ''];

const questionTypeDescriptions = {
  [ExerciseQuestionTypeOptions.options]:
    'Participant will be expected to choose one correct response from the following options',
  [ExerciseQuestionTypeOptions.descriptive_answer]:
    'Participant will be expected to respond with a short description to the prompt',
  [ExerciseQuestionTypeOptions.image_upload]:
    'Participant will be expected to upload files. They may upload multiple files, but must at least upload one file to mark this exercise as complete.',
  [ExerciseQuestionTypeOptions.link]:
    'Participant will be expected to enter a link',
};

type previewImage = {
  url: string;
  file: any;
};

@Component({
  selector: 'app-chapter-published',
  templateUrl: './chapter-published.component.html',
  styleUrls: [
    './chapter-published.component.scss',
    './../../../../../../../../shared/common/shared-styles.css',
  ],
})
export class ChapterPublishedComponent implements OnInit, OnDestroy {
  resource = resources.CHAPTER;
  resourceActions = RESOURCE_ACTIONS;
  courseStatusOptions = CourseStatusOptions;
  chapterStatusOptions = ChapterStatusOptions;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<User>;
  currentMember: User;
  @Select(ChapterState.getChapterFormRecord)
  chapter$: Observable<Chapter>;
  chapter: Chapter;
  @Select(ExerciseState.listExercises)
  exercises$: Observable<{
    exercises: Exercise[];
    submissions: ExerciseSubmission[];
  }>;
  exercises: Exercise[];
  @Select(ExerciseState.isFetching)
  isFetchingExercises$: Observable<boolean>;
  isFetchingExercises: boolean;
  @Select(ChapterState.isFetching)
  isFetchingChapter$: Observable<boolean>;
  @Select(ExerciseSubmissionState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  formSubmitting: boolean;
  @Select(ExerciseState.errorFetching)
  errorFetching$: Observable<boolean>;
  errorFetching: boolean;
  questionTypeDescriptions = questionTypeDescriptions;
  questionTypes: any = ExerciseQuestionTypeOptions;
  questionTypeOptions: MatSelectOption[] = autoGenOptions(this.questionTypes);
  exerciseFormOptions: string[] = startingExerciseFormOptions;
  invalidOptions: boolean = false;
  formErrorMessages: string = '';
  exerciseSubmissions: ExerciseSubmission[] = [];
  imagesQueuedForUpload: any = {};
  uploadedImages: any = {};
  formDirective: FormGroupDirective;
  tempAnswers = {};
  tempLinks = {};
  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private auth: AuthorizationService,
    private uploadService: UploadService,
    private exerciseSubmissionService: ExerciseSubmissionService
  ) {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.isFetchingExercises$.subscribe((val) => {
      this.isFetchingExercises = val;
    });
    this.chapter$.subscribe((val) => {
      this.chapter = val;

      this.fetchExercises();
    });
    this.exercises$.subscribe((val) => {
      this.exercises = sortByIndex(val.exercises);
      this.setupExerciseSubmissions(val.submissions);
    });

    this.formSubmitting$.subscribe((val) => {
      this.formSubmitting = val;
    });
    this.errorFetching$.subscribe((val) => {
      this.errorFetching = val;
    });
  }

  // This is to load up the tempAnswers and tempLinks
  setupTempVariables = () => {
    this.tempAnswers = {};
    this.tempLinks = {};
    this.exerciseSubmissions.forEach((s) => {
      this.tempAnswers[s.exercise] = s.answer;
      this.tempLinks[s.exercise] = s.link;
    });
  };

  setupExerciseSubmissions(submissions) {
    this.exerciseSubmissions = this.exercises.map(
      (e: Exercise): ExerciseSubmission => {
        const submission = submissions.find((sub) => {
          return sub.exercise?.id == e.id;
        });
        if (submission) {
          return this.exerciseSubmissionService.sanitizeExerciseSubmissions([
            submission,
          ])[0];
        } else {
          return this.setupExerciseSubmission(e);
        }
      }
    );
    this.setupTempVariables();
  }
  chapterTitle(chapter) {
    return ChapterTitle(chapter);
  }
  chapterSubtitle(chapter) {
    return ChapterSubtitle(chapter);
  }

  exerciseTitle(exercise: Exercise): string {
    return ExerciseTitle(this.chapter, exercise);
  }
  submissionStatus(submission: ExerciseSubmission): string {
    return SubmissionStatus(submission);
  }
  exercisePoints(submission: ExerciseSubmission): string {
    const exercise = this.exercises.find((e) => e.id == submission.exercise);
    return SubmissionPoints(submission, exercise);
  }
  setupExerciseSubmission(exercise: Exercise): ExerciseSubmission {
    let submission: ExerciseSubmission = Object.assign(
      {},
      emptyExerciseSubmissionFormRecord
    );
    submission.exercise = exercise?.id;
    submission.chapter = exercise.chapter?.id;
    submission.course = exercise.chapter?.course?.id;
    submission.participant = this.currentMember?.id;

    return submission;
  }

  exerciseSubmissionOf(exercise) {
    const index = this.exerciseSubmissions.findIndex(
      (e) => e.exercise == exercise.id
    );
    return index >= 0
      ? this.exerciseSubmissions[index]
      : emptyExerciseSubmissionFormRecord;
  }

  showExpandedImage(image) {
    const dialogRef = this.dialog.open(ImageDisplayDialog, {
      data: {
        image,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  chapterFilters() {
    return this.chapter?.id ? { chapterId: this.chapter?.id } : false;
  }

  fetchExercises() {
    if (this.chapterFilters()) {
      this.store.dispatch(
        new FetchExercisesAction({
          searchParams: {
            ...defaultSearchParams,
            pageSize: null,
            columnFilters: this.chapterFilters(),
          },
        })
      );
    }
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  allowSubmissionCreation() {
    const authorized = this.auth.authorizeResource(
      resources.EXERCISE_SUBMISSION,
      this.resourceActions.CREATE
    );
    const submissionAllowed = this.getSubmittableExercises().length;
    return authorized && submissionAllowed;
  }

  disableExerciseModification(exercise) {
    const submission = this.exerciseSubmissions.find(
      (sub) => sub.exercise == exercise.id
    );
    const graded = submission?.status == ExerciseSubmissionStatusOptions.graded;
    const submitted =
      submission?.status == ExerciseSubmissionStatusOptions.submitted;
    const exerciseLocked = graded || submitted; // Exercise is locked if it is submitted or graded
    const submissionDisabled = !this.allowSubmissionCreation(); // When the user does not have the permissions to submit
    return submissionDisabled || exerciseLocked; // Disabling exercise modification if the submission is disabled or exercise is locked
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const chapterId = params['id'];
      this.store.dispatch(new GetChapterAction({ id: chapterId }));
    });
  }

  goToCourse() {
    this.router.navigate([uiroutes.COURSE_PROFILE_ROUTE.route], {
      queryParams: { id: this.chapter?.course?.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  editChapter() {
    this.router.navigate([uiroutes.CHAPTER_FORM_ROUTE.route], {
      queryParams: { id: this.chapter?.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
  deleteConfirmation() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the chapter titled "${this.chapter.title}"`,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteChapter();
      }
    });
  }
  deleteChapter() {
    this.store.dispatch(new DeleteChapterAction({ id: this.chapter?.id }));
  }

  deleteExerciseConfirmation(exercise) {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the chapter titled "${this.chapter.title}"`,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteExercise(exercise);
      }
    });
  }
  deleteExercise(exercise) {
    this.store.dispatch(new DeleteExerciseAction({ id: exercise?.id }));
  }

  reorderExercises() {
    const exercisesList: DragDropInput[] = this.exercises.map((e) => {
      return { id: e.id, label: e.prompt };
    });

    const dialogRef = this.dialog.open(DragDropComponent, {
      data: exercisesList,
    });

    dialogRef.afterClosed().subscribe((newIndexArray) => {
      let i = 1;
      const reorderedList = newIndexArray.map((index) => {
        let exercise = this.exercises.find((e) => e.id == index);
        exercise = { ...exercise, index: i };
        i++;
        return exercise;
      });

      this.exercises = Object.assign([], reorderedList);

      const indexList = this.exercises.map((e) => {
        return { id: e.id, index: e.index };
      });
      this.store.dispatch(new ReorderExercisesAction({ indexList }));
    });
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  showQuestionTypeLabel(value) {
    return getOptionLabel(value, this.questionTypeOptions);
  }

  updateExerciseSubmissionAnswer(exercise) {
    let newExerciseSubmissions = this.exerciseSubmissions.map((e) => {
      if (e?.exercise == exercise.id) {
        let newSubmission = Object.assign({}, e);
        newSubmission.answer = this.tempAnswers[exercise.id];
        return newSubmission;
      } else return e;
    });
    this.exerciseSubmissions = newExerciseSubmissions;
  }

  updateExerciseSubmissionLink(exercise) {
    let newExerciseSubmissions = this.exerciseSubmissions.map((e) => {
      if (e?.exercise == exercise.id) {
        let newSubmission = Object.assign({}, e);
        newSubmission.link = this.tempLinks[exercise.id];
        return newSubmission;
      } else return e;
    });
    this.exerciseSubmissions = newExerciseSubmissions;
  }

  updateExerciseSubmissionOption(option, exercise) {
    let newExerciseSubmissions = this.exerciseSubmissions.map((e) => {
      if (e?.exercise == exercise.id) {
        let newSubmission = Object.assign({}, e);
        newSubmission.option = option;
        return newSubmission;
      } else return e;
    });
    this.exerciseSubmissions = newExerciseSubmissions;
  }

  updateExerciseSubmissionImages(exerciseId, images) {
    let newExerciseSubmissions = this.exerciseSubmissions.map((e) => {
      if (e?.exercise == exerciseId) {
        let newSubmission = Object.assign({}, e);
        newSubmission.images = images;
        return newSubmission;
      } else return e;
    });
    this.exerciseSubmissions = newExerciseSubmissions;
  }

  removePreviewImage(exercise, i) {
    let imagesQueuedForExercise = Object.assign(
      [],
      this.imagesQueuedForUpload[exercise.id]
    );
    imagesQueuedForExercise.splice(i, 1);
    this.imagesQueuedForUpload[exercise.id] = imagesQueuedForExercise;
  }

  removeExistingImage(exercise, i) {
    let newExerciseSubmissions = this.exerciseSubmissions.map((e) => {
      if (e?.exercise == exercise.id) {
        let newSubmission = Object.assign({}, e);
        let newImages = Object.assign([], newSubmission.images);
        newImages.splice(i, 1);
        newSubmission = {
          ...newSubmission,
          images: newImages,
        };
        return newSubmission;
      } else return e;
    });
    this.exerciseSubmissions = newExerciseSubmissions;
  }
  uploadImage(imageIndex, exerciseId) {
    const formData = new FormData();
    formData.append(
      'file',
      this.imagesQueuedForUpload[exerciseId][imageIndex].file
    );
    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Uploading file',
      })
    );
    this.uploadService.upload(formData).subscribe(
      (res) => {
        const url = res.secure_url;
        this.store.dispatch(
          new ToggleLoadingScreen({
            showLoadingScreen: false,
            message: '',
          })
        );
        // We update the referenceImages field in the form with the new url
        this.uploadedImages[exerciseId] =
          this.uploadedImages[exerciseId].concat(url);
        this.updateExerciseSubmissionImages(
          exerciseId,
          this.uploadedImages[exerciseId]
        );
        // Checking if this is the final image to be uploaded..
        const allExerciseIds = Object.keys(this.imagesQueuedForUpload);
        const lastExerciseId = allExerciseIds[allExerciseIds.length - 1];
        const lastImageIndex =
          this.imagesQueuedForUpload[exerciseId].length - 1;
        if (exerciseId == lastExerciseId && imageIndex == lastImageIndex) {
          // if it is, then we update the form and submit it.

          this.submitExerciseSubmissionForm();
        } else {
          imageIndex++;
          this.uploadImage(imageIndex, exerciseId);
        }
      },
      (err) => {
        this.store.dispatch(
          new ShowNotificationAction({
            message:
              'Something went wrong while uploading the reference images!',
            action: 'error',
          })
        );
      }
    );
  }

  imagesExist() {
    let exist = false;
    const exerciseIdsWithImages = Object.keys(this.imagesQueuedForUpload);
    if (exerciseIdsWithImages.length > 0) {
      exist = true;
    } else {
      exerciseIdsWithImages.forEach((id) => {
        if (this.imagesQueuedForUpload[id].length > 0) {
          exist = true;
        }
      });
    }
    return exist;
  }

  uploadNewImages() {
    if (this.imagesExist()) {
      const exerciseIdsWithImages = Object.keys(this.imagesQueuedForUpload);
      exerciseIdsWithImages.forEach((id) => {
        this.uploadedImages[id] = [];
      });
      for (let i = 0; i < exerciseIdsWithImages.length; i++) {
        if (this.imagesQueuedForUpload[exerciseIdsWithImages[i]].length) {
          this.uploadImage(0, exerciseIdsWithImages[i]);
        }
      }
    } else {
      this.submitExerciseSubmissionForm();
    }
  }

  addImageFileToSubmission(event, exercise) {
    if (event.target.files.length > 0) {
      let previewImageObject: previewImage = { file: null, url: null };
      const file = event.target.files[0];
      const fileValid = file.type.startsWith('image/');
      if (fileValid) {
        previewImageObject.file = file;

        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          previewImageObject.url = url;
        };
        reader.readAsDataURL(file);
        let imagesQueuedForExercise = Object.assign(
          [],
          this.imagesQueuedForUpload[exercise.id]
        );
        imagesQueuedForExercise = imagesQueuedForExercise.concat([
          previewImageObject,
        ]);
        this.imagesQueuedForUpload[exercise.id] = imagesQueuedForExercise;
      } else {
        event.target.value = null;
        this.store.dispatch(
          new ShowNotificationAction({
            message: 'Please upload only images',
            action: 'error',
          })
        );
      }
    }
  }

  renderRubric(exercise: Exercise) {
    return JSON.parse(exercise.rubric);
  }

  showRubric(exercise: Exercise) {
    const rubric = this.renderRubric(exercise);
    return rubric?.length > 0;
  }

  openRubricDialog(exercise: Exercise, submission: ExerciseSubmission) {
    const dialogRef = this.dialog.open(ExerciseRubricDialog, {
      data: {
        exercise,
        submission,
        rubric: this.renderRubric(exercise),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  updateFormBeforeSubmit() {
    if (!this.formSubmitting) {
      this.uploadNewImages();
    }
  }

  validateExerciseSubmissions() {
    let submissionsValid = true;

    this.exercises.forEach((e) => {
      if (e.required == true) {
        const questionType = e.questionType;
        const submission = this.exerciseSubmissions.find(
          (s) => s.exercise == e.id
        );
        switch (questionType) {
          case this.questionTypes.description:
            if (!submission?.answer) {
              submissionsValid = false;
            }
            break;
          case this.questionTypes.option:
            if (!submission?.option) {
              submissionsValid = false;
            }
            break;
          case this.questionTypes.image_upload:
            if (!submission?.images?.length) {
              submissionsValid = false;
            }
            break;
          case this.questionTypes.link:
            if (!submission?.link) {
              submissionsValid = false;
            }
            break;
        }
      }
    });
    return submissionsValid;
  }

  ngOnDestroy() {
    this.store.dispatch(new ResetExerciseStateAction());
    this.store.dispatch(new ResetChapterFormAction());
  }

  getSubmittableExercises(): ExerciseSubmission[] {
    return this.exerciseSubmissions.filter((s) => {
      return (
        s.status !== ExerciseSubmissionStatusOptions.graded &&
        s.status !== ExerciseSubmissionStatusOptions.submitted
      );
    });
  }

  submitExerciseSubmissionForm() {
    let newSubmissions = this.getSubmittableExercises();
    newSubmissions = newSubmissions.map((s) => {
      const newS = { ...s, status: ExerciseSubmissionStatusOptions.submitted };
      return newS;
    });
    const validationResult = this.validateExerciseSubmissions();
    if (validationResult && newSubmissions.length) {
      this.store.dispatch(
        new CreateUpdateExerciseSubmissionsAction({
          exerciseSubmissions: newSubmissions,
          grading: false,
        })
      );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please fill out all the required fields before attempting to submit!',
          action: 'error',
        })
      );
    }
  }
}

@Component({
  selector: 'exercise-rubric-dialog',
  templateUrl: './exercise-rubric-dialog/exercise-rubric-dialog.html',
  styleUrls: [
    './exercise-rubric-dialog/exercise.rubric.dialog.scss',
    './../../../../../../../../shared/common/shared-styles.css',
  ],
})
export class ExerciseRubricDialog {
  exercise: Exercise;
  submission: ExerciseSubmission;
  rubric: any;
  rubricDatatableColumns: string[] = ['description', 'points'];
  constructor(
    public dialogRef: MatDialogRef<ExerciseRubricDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.exercise = data.exercise;
    this.submission = data.submission;
    this.rubric = data.rubric;
    if (this.submission.status !== ExerciseSubmissionStatusOptions.pending) {
      // Adding 'satisfied' column only if the submission is already created
      this.rubricDatatableColumns.push('satisfied');
    }
  }

  renderRubricForTable(exerciseSubmission: ExerciseSubmission) {
    const tableData = this.rubric.map((c) => {
      c['satisfied'] =
        exerciseSubmission?.criteriaSatisfied?.includes(c.description) == true
          ? true
          : false;
      return c;
    });
    return tableData;
  }

  isCriterionSatisfied(
    exerciseSubmission: ExerciseSubmission,
    description: string
  ): boolean {
    return exerciseSubmission.criteriaSatisfied?.includes(description);
  }
}
