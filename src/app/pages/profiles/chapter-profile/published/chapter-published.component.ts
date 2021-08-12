import { Component, Inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteChapterAction,
  GetChapterAction,
  PublishChapterAction,
  ResetChapterFormAction,
} from 'src/app/shared/state/chapters/chapter.actions';
import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';
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
  ExerciseKey,
  ExerciseQuestionTypeOptions,
  ExerciseSubmission,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { ExerciseState } from 'src/app/shared/state/exercises/exercise.state';
import {
  CreateUpdateExerciseAction,
  DeleteExerciseAction,
  FetchExercisesAction,
  FetchNextExercisesAction,
  ResetExerciseFormAction,
} from 'src/app/shared/state/exercises/exercise.actions';
import {
  autoGenOptions,
  getOptionLabel,
  parseDateTime,
} from 'src/app/shared/common/functions';
import {
  emptyExerciseFormRecord,
  emptyExerciseKeyFormRecord,
} from 'src/app/shared/state/exercises/exercise.model';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import {
  CreateUpdateExerciseSubmissionsAction,
  ResetExerciseSubmissionFormAction,
} from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.actions';
import {
  ChapterDeleteConfirmationDialog,
  ExercicseDeleteConfirmationDialog,
} from '../chapter-profile.component';
import { emptyExerciseSubmissionFormRecord } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.model';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { UploadService } from 'src/app/shared/api/upload.service';
import { environment } from 'src/environments/environment';
import { AuthState } from 'src/app/shared/state/auth/auth.state';

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
    './../../../../shared/common/shared-styles.css',
  ],
})
export class ChapterPublishedComponent implements OnInit {
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
  exercises$: Observable<Exercise[]>;
  exercises: Exercise[];
  @Select(ExerciseState.isFetching)
  isFetchingExercises$: Observable<boolean>;
  isFetchingExercises: boolean;
  @Select(ChapterState.isFetching)
  isFetchingChapter$: Observable<boolean>;
  @Select(ExerciseState.formSubmitting)
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
  imagesQueuedForUpload: previewImage[] = [];
  formDirective: FormGroupDirective;
  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private auth: AuthorizationService,
    private uploadService: UploadService
  ) {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.isFetchingExercises$.subscribe((val) => {
      this.isFetchingExercises = val;
    });
    this.exercises$.subscribe((val) => {
      this.exercises = val;
      console.log('this.exercises', { exercises: this.exercises });
      this.exerciseSubmissions = this.exercises.map(
        (e: Exercise): ExerciseSubmission => {
          return this.setupExerciseSubmission(e);
        }
      );
      console.log('exerciseSubmissions', {
        exerciseSubmissions: this.exerciseSubmissions,
      });
    });
    this.chapter$.subscribe((val) => {
      this.chapter = val;
      console.log('Current chapter => ', this.chapter);
      this.fetchExercises();
    });
    this.formSubmitting$.subscribe((val) => {
      this.formSubmitting = val;
    });
    this.errorFetching$.subscribe((val) => {
      this.errorFetching = val;
    });
  }

  setupExerciseSubmission(exercise: Exercise): ExerciseSubmission {
    let submission: ExerciseSubmission = Object.assign(
      {},
      emptyExerciseSubmissionFormRecord
    );
    submission.exercise = exercise?.id;
    submission.chapter = this.chapter.id;
    submission.course = exercise?.course?.id;
    submission.participant = this.currentMember?.id;
    console.log('submission');
    return submission;
  }

  exerciseSubmissionOf(exercise) {
    const submission = this.exerciseSubmissions.find(
      (e) => e.exercise == exercise.id
    );
    return submission ? submission : emptyExerciseSubmissionFormRecord;
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
    return this.auth.authorizeResource(
      resources.EXERCISE_SUBMISSION,
      this.resourceActions.CREATE
    );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const chapterId = params['id'];
      this.store.dispatch(new GetChapterAction({ id: chapterId }));
    });
  }

  goBack() {
    this.location.back();
  }

  editChapter() {
    this.router.navigate([uiroutes.CHAPTER_FORM_ROUTE.route], {
      queryParams: { id: this.chapter?.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
  deleteConfirmation() {
    const dialogRef = this.dialog.open(ChapterDeleteConfirmationDialog, {
      data: this.chapter,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('close dialog result for announcment => ', result);
      if (result == true) {
        this.deleteChapter();
      }
    });
  }
  deleteChapter() {
    console.log('payload before passing to action => ', {
      id: this.chapter.id,
    });
    this.store.dispatch(new DeleteChapterAction({ id: this.chapter?.id }));
  }

  deleteExerciseConfirmation(exercise) {
    const dialogRef = this.dialog.open(ExercicseDeleteConfirmationDialog, {
      data: exercise,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('close dialog result for exercise => ', result);
      if (result == true) {
        this.deleteExercise(exercise);
      }
    });
  }
  deleteExercise(exercise) {
    console.log('payload before passing to action => ', {
      id: exercise.id,
    });
    this.store.dispatch(new DeleteExerciseAction({ id: exercise?.id }));
  }
  onScroll() {
    console.log('scrolling exercises');
    if (!this.isFetchingExercises) {
      this.store.dispatch(new FetchNextExercisesAction());
    }
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  showQuestionTypeLabel(value) {
    return getOptionLabel(value, this.questionTypeOptions);
  }

  updateExerciseSubmissionAnswer(event, question) {
    console.log('from updateExerciseSubmissionAnswer', { question, event });
  }

  updateExerciseSubmissionLink(event, question) {
    console.log('from updateExerciseSubmissionLink', { question, event });
  }

  updateExerciseSubmissionOption(question, option) {
    console.log({ option });
    let exerciseSubmission = this.exerciseSubmissions.find(
      (e) => e.exercise?.id == question.id
    );
    let newExerciseSubmission = Object.assign({}, exerciseSubmission);
    newExerciseSubmission.option = option;
    const newExerciseSubmissions = this.exerciseSubmissions.map((e) => {
      return e.exercise?.id == question.id ? newExerciseSubmission : e;
    });
    this.exerciseSubmissions = newExerciseSubmissions;
  }

  uploadImage(imageIndex) {
    // if (this.imagesQueuedForUpload.length == 0) {
    //   this.submitExerciseForm();
    // } else {
    //   const formData = new FormData();
    //   formData.append('file', this.imagesQueuedForUpload[imageIndex].file);
    //   this.uploadService.upload(formData).subscribe(
    //     (res) => {
    //       const url = `${environment.api_endpoint}${res.file}`;
    //       console.log('uploading new file ', imageIndex, url);
    //       const existingReferenceImages = form.get('referenceImages').value;
    //       // We update the referenceImages field in the form with the new url
    //       const newReferenceImages = existingReferenceImages.concat(url);
    //       form.get('referenceImages').setValue(newReferenceImages);
    //       // Checking if this is the final image to be uploaded..
    //       if (imageIndex == this.imagesQueuedForUpload.length - 1) {
    //         // if it is, then we update the form and submit it.
    //         this.submitExerciseForm();
    //       } else {
    //         imageIndex++;
    //         this.uploadImage(imageIndex);
    //       }
    //     },
    //     (err) => {
    //       console.log('Error while uploading image', { err });
    //       this.store.dispatch(
    //         new ShowNotificationAction({
    //           message:
    //             'Something went wrong while uploading the reference images!',
    //           action: 'error',
    //         })
    //       );
    //     }
    //   );
    // }
  }

  uploadNewImages() {
    console.log('Starting to upload reference images', {
      imagesQueuedForUpload: this.imagesQueuedForUpload,
    });
    this.uploadImage(0);
  }

  addImageFileToSubmission(event, question) {
    if (event.target.files.length > 0) {
      let previewImageObject: previewImage = { file: null, url: null };
      const file = event.target.files[0];
      previewImageObject.file = file;

      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        previewImageObject.url = url;
      };
      reader.readAsDataURL(file);

      this.imagesQueuedForUpload.push(previewImageObject);
      console.log('updated imagesQueuedForUpload', {
        imagesQueuedForUpload: this.imagesQueuedForUpload,
      });
    }
  }

  removePreviewImage(i) {
    this.imagesQueuedForUpload.splice(i, 1);
  }
  removeExistingImage(question, i) {
    let exerciseSubmission = this.exerciseSubmissions.find(
      (e) => e.id == question.id
    );
    let newImages = Object.assign([], exerciseSubmission.images);
    newImages.splice(i, 1);
    exerciseSubmission = {
      ...exerciseSubmission,
      images: newImages,
    };
    this.exerciseSubmissions = this.exerciseSubmissions.map((e) =>
      e.id == question.id ? exerciseSubmission : e
    );
  }
  updateFormBeforeSubmit() {
    console.log('imagesQueuedForUpload', {
      imagesQueuedForUpload: this.imagesQueuedForUpload,
    });
    this.uploadNewImages();
  }

  submitExerciseForm() {
    if (!this.invalidOptions) {
      this.store.dispatch(
        new CreateUpdateExerciseSubmissionsAction({
          exerciseSubmissions: this.exerciseSubmissions,
        })
      );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message: 'Something went wrong while submitting this form!',
          action: 'error',
        })
      );
    }
  }
}
