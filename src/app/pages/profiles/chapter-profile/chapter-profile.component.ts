import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteChapterAction,
  GetChapterAction,
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
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { ExerciseSubmissionState } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.state';
import { emptyExerciseSubmissionFormRecord } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.model';

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
  selector: 'app-chapter-profile',
  templateUrl: './chapter-profile.component.html',
  styleUrls: [
    './chapter-profile.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class ChapterProfileComponent implements OnInit, OnDestroy {
  resource = resources.CHAPTER;
  resourceActions = RESOURCE_ACTIONS;
  @Select(ChapterState.getChapterFormRecord)
  chapter$: Observable<Chapter>;
  chapter: Chapter;
  @Select(ExerciseState.listExercises)
  exercises$: Observable<Exercise[]>;
  @Select(ExerciseState.isFetching)
  isFetchingExercises$: Observable<boolean>;
  isFetchingExercises: boolean;
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
  exerciseKey: any = { validAnswers: [''] };
  exerciseSubmission: ExerciseSubmission = emptyExerciseSubmissionFormRecord;
  imagesQueuedForUpload: previewImage[] = [];
  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private auth: AuthorizationService,
    private fb: FormBuilder
  ) {
    this.isFetchingExercises$.subscribe((val) => {
      this.isFetchingExercises = val;
    });
    this.chapter$.subscribe((val) => {
      this.chapter = val;
      console.log('Current chapter => ', this.chapter);
      this.fetchExercises();
      this.exerciseForm = this.setupExerciseForm();
    });
    this.formSubmitting$.subscribe((val) => {
      this.formSubmitting = val;
    });
    this.errorFetching$.subscribe((val) => {
      this.errorFetching = val;
    });
  }

  setupExerciseForm(exerciseFormRecord: Exercise = emptyExerciseFormRecord) {
    return this.fb.group({
      id: [exerciseFormRecord?.id],
      prompt: [exerciseFormRecord?.prompt, Validators.required],
      chapter: [this.chapter?.id, Validators.required],
      questionType: [exerciseFormRecord?.questionType],
      options: [exerciseFormRecord?.options],
      points: [exerciseFormRecord?.points],
      required: [exerciseFormRecord?.required],
      validOption: [],
      validAnswers: [],
      referenceLink: [],
      referenceImages: [],
    });
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
            newColumnFilters: this.chapterFilters(),
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

  editExercise(exercise) {
    console.log('editing exercise ', { exercise });
    this.resetExerciseForm();
    this.exerciseForm = this.setupExerciseForm(exercise);
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
  resetExerciseForm() {
    this.exerciseForm = this.setupExerciseForm();
    this.exerciseFormOptions = startingExerciseFormOptions;
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
    // Checking if the exercise form options is less than 5 options and if the last option was valid or not
    return (
      this.exerciseKey?.validAnswers?.length < 5 &&
      this.exerciseKey?.validAnswers[this.exerciseKey?.validAnswers?.length - 1]
        .length
    );
  }
  addValidAnswer() {
    this.exerciseKey.validAnswers = this.exerciseKey?.validAnswers?.concat([
      '',
    ]);
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

  uploadReferenceImages() {}

  updateGradingKeyInExerciseForm(form) {
    console.log('exerciseKey', { exerciseKey: this.exerciseKey });
    form.get('validOption').setValue(this.exerciseKey.option);
    let allValidAnswers = [this.exerciseKey?.answer].concat(
      this.exerciseKey?.validAnswers
    );
    allValidAnswers = allValidAnswers.filter((a) => a?.length > 0); // removing empty answers if any
    allValidAnswers = [...new Set(allValidAnswers)]; // removing duplicates
    form.get('validAnswers').setValue(allValidAnswers);
    form.get('referenceLink').setValue(this.exerciseKey.link);
    form.get('referenceImages').setValue([]);
  }

  updateExerciseFormOptions() {
    this.exerciseForm.get('options').setValue(this.exerciseFormOptions);
  }

  showQuestionTypeLabel(value) {
    return getOptionLabel(value, this.questionTypeOptions);
  }

  updateExerciseSubmissionOption(option) {
    let newExerciseSubmission = Object.assign({}, this.exerciseSubmission);
    newExerciseSubmission.option = option;
    this.exerciseSubmission = newExerciseSubmission;
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

  submitExerciseForm(form, formDirective) {
    console.log('exercise submit form value => ', form.value);
    this.sanitizeAndUpdateOptions(form);
    this.updateGradingKeyInExerciseForm(form);
    if (!this.invalidOptions) {
      this.store.dispatch(
        new CreateUpdateExerciseAction({
          form,
          formDirective,
        })
      );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message: this.formErrorMessages,
          action: 'error',
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetExerciseFormAction());
    this.store.dispatch(new ResetChapterFormAction());
  }
}

@Component({
  selector: 'chapter-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.html',
})
export class ChapterDeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<ChapterDeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Chapter
  ) {}
}

@Component({
  selector: 'exercise-delete-confirmation-dialog',
  templateUrl: './delete-exercise-confirmation-dialog.html',
})
export class ExercicseDeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<ExercicseDeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Exercise
  ) {}
}
