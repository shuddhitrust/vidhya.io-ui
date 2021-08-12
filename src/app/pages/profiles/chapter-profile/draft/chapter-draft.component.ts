import { Component, Inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteChapterAction,
  GetChapterAction,
  PublishChapterAction,
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
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { ExerciseState } from 'src/app/shared/state/exercises/exercise.state';
import {
  CreateUpdateExerciseAction,
  DeleteExerciseAction,
  FetchExercisesAction,
  FetchNextExercisesAction,
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
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { ExerciseSubmissionState } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.state';
import { emptyExerciseSubmissionFormRecord } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.model';
import { ExerciseKeyState } from 'src/app/shared/state/exerciseKeys/exerciseKey.state';
import { FetchExerciseKeysAction } from 'src/app/shared/state/exerciseKeys/exerciseKey.actions';
import { UploadService } from 'src/app/shared/api/upload.service';
import { environment } from 'src/environments/environment';
import { ObserversModule } from '@angular/cdk/observers';
import { ObserveOnSubscriber } from 'rxjs/internal/operators/observeOn';
import {
  ChapterDeleteConfirmationDialog,
  ExercicseDeleteConfirmationDialog,
} from '../chapter-profile.component';
const startingExerciseFormOptions = ['', ''];

type previewImage = {
  url: string;
  file: any;
};

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

@Component({
  selector: 'app-chapter-draft',
  templateUrl: './chapter-draft.component.html',
  styleUrls: [
    './chapter-draft.component.scss',
    './../../../../shared/common/shared-styles.css',
  ],
})
export class ChapterDraftComponent implements OnInit {
  resource = resources.CHAPTER;
  resourceActions = RESOURCE_ACTIONS;
  courseStatusOptions = CourseStatusOptions;
  chapterStatusOptions = ChapterStatusOptions;
  @Select(ChapterState.getChapterFormRecord)
  chapter$: Observable<Chapter>;
  chapter: Chapter;
  @Select(ExerciseKeyState.listExerciseKeys)
  exerciseKeys$: Observable<ExerciseKey[]>;
  exerciseKeys: ExerciseKey[];
  @Select(ExerciseKeyState.isFetching)
  isFetchingExerciseKeys$: Observable<boolean>;
  isFetchingExerciseKeys: boolean;
  @Select(ChapterState.isFetching)
  isFetchingChapter$: Observable<boolean>;
  exerciseForm: FormGroup = this.setupExerciseForm();
  showExerciseForm: boolean = false;
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
  exerciseKey: any = emptyExerciseKeyFormRecord;
  imagesQueuedForUpload: previewImage[] = [];
  formDirective: FormGroupDirective;
  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private auth: AuthorizationService,
    private fb: FormBuilder,
    private uploadService: UploadService
  ) {
    this.isFetchingExerciseKeys$.subscribe((val) => {
      this.isFetchingExerciseKeys = val;
    });
    this.exerciseKeys$.subscribe((val) => {
      this.exerciseKeys = val;
    });
    this.chapter$.subscribe((val) => {
      this.chapter = val;
      console.log('Current chapter => ', this.chapter);
      this.fetchExerciseKeys();
      this.exerciseForm = this.setupExerciseForm();
    });
    this.formSubmitting$.subscribe((val) => {
      this.formSubmitting = val;
    });
    this.errorFetching$.subscribe((val) => {
      this.errorFetching = val;
    });
  }

  sanitizeExerciseKeyRecord(exerciseKeyRecord) {
    this.exerciseFormOptions = exerciseKeyRecord.exercise?.options?.length
      ? exerciseKeyRecord?.exercise?.options
      : startingExerciseFormOptions;
    const validAnswers =
      exerciseKeyRecord?.validAnswers.length > 0
        ? exerciseKeyRecord?.validAnswers
        : [''];
    let finalExerciseKeyRecord = { ...exerciseKeyRecord, validAnswers };
    this.exerciseKey = finalExerciseKeyRecord;
    return this.exerciseKey;
  }

  setupExerciseForm(
    exerciseKeyRecord: ExerciseKey = emptyExerciseKeyFormRecord
  ) {
    exerciseKeyRecord = this.sanitizeExerciseKeyRecord(exerciseKeyRecord);
    return this.fb.group({
      id: [exerciseKeyRecord?.exercise?.id],
      prompt: [exerciseKeyRecord?.exercise?.prompt, Validators.required],
      course: [this.chapter?.course?.id, Validators.required],
      chapter: [this.chapter?.id, Validators.required],
      questionType: [exerciseKeyRecord?.exercise?.questionType],
      options: [exerciseKeyRecord?.exercise?.options],
      points: [exerciseKeyRecord?.exercise?.points],
      required: [exerciseKeyRecord?.exercise?.required],
      validOption: [exerciseKeyRecord?.validOption],
      validAnswers: [exerciseKeyRecord?.validAnswers],
      referenceLink: [exerciseKeyRecord?.referenceLink],
      referenceImages: [exerciseKeyRecord?.referenceImages],
    });
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  chapterFilters() {
    return this.chapter?.id ? { chapterId: this.chapter?.id } : false;
  }

  fetchExerciseKeys() {
    if (this.chapterFilters()) {
      this.store.dispatch(
        new FetchExerciseKeysAction({
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

  showExerciseFormInsteadOfCard(exercise) {
    return (
      this.showExerciseForm && this.exerciseForm.get('id').value == exercise.id
    );
  }
  showPublishChapterButton() {
    return (
      this.authorizeResourceMethod(this.resourceActions.UPDATE) &&
      this.chapter.status == this.chapterStatusOptions.draft &&
      this.chapter?.course?.status == this.courseStatusOptions.published
    );
  }
  publishChapter() {
    this.store.dispatch(new PublishChapterAction({ id: this.chapter.id }));
  }

  editExercise(exerciseKey) {
    const exercise = exerciseKey?.exercise;
    this.resetExerciseForm();
    this.exerciseForm = this.setupExerciseForm(exerciseKey);
    console.log('editing exercise ', {
      exercise,
      exerciseKeys: this.exerciseKeys,
      exerciseKey: exerciseKey,
    });
    this.showExerciseForm = true;
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
  deleteExercise(exerciseKey) {
    const exercise = exerciseKey?.exercise;
    console.log('payload before passing to action => ', {
      id: exercise.id,
    });
    this.store.dispatch(new DeleteExerciseAction({ id: exercise?.id }));
  }
  onScroll() {
    console.log('scrolling exercises');
    if (!this.isFetchingExerciseKeys) {
      this.store.dispatch(new FetchNextExercisesAction());
    }
  }
  resetExerciseForm() {
    this.exerciseForm = this.setupExerciseForm();
    this.exerciseFormOptions = startingExerciseFormOptions;
    this.imagesQueuedForUpload = [];
    this.resetFormOptionErrors();
  }
  addExercise() {
    this.resetExerciseForm();
    this.showExerciseForm = true;
  }

  closeExerciseForm() {
    this.resetExerciseForm();
    this.showExerciseForm = false;
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  enableAddNewOption() {
    // Checking if the exercise form options is less than 5 options and if the last option was valid or not
    return (
      this.exerciseFormOptions.length < 5 &&
      this.exerciseFormOptions[this.exerciseFormOptions.length - 1].length
    );
  }

  addOption() {
    this.exerciseFormOptions = this.exerciseFormOptions.concat(['']);
  }

  enableAddNewValidAnswer() {
    const lastAnswerExists =
      this.exerciseKey?.validAnswers.length > 0
        ? this.exerciseKey?.validAnswers[
            this.exerciseKey?.validAnswers?.length - 1
          ].length
        : true;
    // Checking if the exercise form options is less than 5 options and if the last option was valid or not
    return this.exerciseKey?.validAnswers?.length < 5 && lastAnswerExists;
  }
  addValidAnswer() {
    let newValidAnswers = Object.assign([], this.exerciseKey.validAnswers);
    newValidAnswers = newValidAnswers.concat(['']);
    this.exerciseKey = { ...this.exerciseKey, validAnswers: newValidAnswers };
  }

  sanitizeAndUpdateOptions(form) {
    let options = null;
    if (form.get('questionType').value == this.questionTypes.options) {
      options = this.exerciseFormOptions.filter((o) => o.length > 0);
      if (options.length < 2) {
        this.invalidOptions = true;
        if (
          !this.formErrorMessages.includes('Please fill in at least 2 options')
        )
          this.formErrorMessages = 'Please fill in at least 2 options';
      } else {
        this.resetFormOptionErrors();
      }
    } else {
      this.resetFormOptionErrors();
    }
    form.get('options').setValue(options);
  }

  resetFormOptionErrors() {
    this.invalidOptions = false;
    this.formErrorMessages = '';
  }

  uploadImage(imageIndex, form) {
    if (this.imagesQueuedForUpload.length == 0) {
      this.submitExerciseForm(form);
    } else {
      const formData = new FormData();
      formData.append('file', this.imagesQueuedForUpload[imageIndex].file);
      this.uploadService.upload(formData).subscribe(
        (res) => {
          const url = `${environment.api_endpoint}${res.file}`;
          console.log('uploading new file ', imageIndex, url);
          const existingReferenceImages = form.get('referenceImages').value;
          // We update the referenceImages field in the form with the new url
          const newReferenceImages = existingReferenceImages.concat(url);
          form.get('referenceImages').setValue(newReferenceImages);
          // Checking if this is the final image to be uploaded..
          if (imageIndex == this.imagesQueuedForUpload.length - 1) {
            // if it is, then we update the form and submit it.
            this.submitExerciseForm(form);
          } else {
            imageIndex++;
            this.uploadImage(imageIndex, form);
          }
        },
        (err) => {
          console.log('Error while uploading image', { err });
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
  }

  uploadNewReferenceImages(form) {
    console.log('Starting to upload reference images', {
      imagesQueuedForUpload: this.imagesQueuedForUpload,
    });
    this.uploadImage(0, form);
  }

  updateGradingKeyInExerciseForm(form) {
    console.log('exerciseKey', { exerciseKey: this.exerciseKey });
    form.get('validOption').setValue(this.exerciseKey.validOption);
    let allValidAnswers = this.exerciseKey?.validAnswers;
    allValidAnswers = allValidAnswers.filter((a) => a?.length > 0); // removing empty answers if any
    allValidAnswers = [...new Set(allValidAnswers)]; // removing duplicates
    form.get('validAnswers').setValue(allValidAnswers);
    form.get('referenceLink').setValue(this.exerciseKey.referenceLink);
    const referenceImages = this.exerciseKey.referenceImages;
    form.get('referenceImages').setValue(referenceImages);
    this.uploadNewReferenceImages(form);
  }

  updateExerciseFormOptions() {
    this.exerciseForm.get('options').setValue(this.exerciseFormOptions);
  }

  showQuestionTypeLabel(value) {
    return getOptionLabel(value, this.questionTypeOptions);
  }

  updateExerciseKeyOption(option) {
    console.log({ option });
    let newExerciseKey = Object.assign({}, this.exerciseKey);
    newExerciseKey.validOption = option;
    this.exerciseKey = newExerciseKey;
  }

  addImageFileToSubmission(event) {
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

  removeReferenceImage(i) {
    let newReferenceImages = Object.assign(
      [],
      this.exerciseKey.referenceImages
    );
    newReferenceImages.splice(i, 1);
    this.exerciseKey = {
      ...this.exerciseKey,
      referenceImages: newReferenceImages,
    };
  }

  updateFormBeforeSubmit(form, formDirective) {
    console.log('imagesQueuedForUpload', {
      imagesQueuedForUpload: this.imagesQueuedForUpload,
    });
    this.formDirective = formDirective;
    this.sanitizeAndUpdateOptions(form);
    this.updateGradingKeyInExerciseForm(form);
  }

  submitExerciseForm(form) {
    console.log('exercise submit form value => ', form.value);
    if (!this.invalidOptions) {
      this.store.dispatch(
        new CreateUpdateExerciseAction({
          form,
          formDirective: this.formDirective,
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
