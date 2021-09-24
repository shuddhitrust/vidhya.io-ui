import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  Chapter,
  ChapterStatusOptions,
  CourseStatusOptions,
  Exercise,
  ExerciseKey,
  ExerciseQuestionTypeOptions,
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
  ReorderExercisesAction,
} from 'src/app/shared/state/exercises/exercise.actions';
import {
  autoGenOptions,
  ChapterSubtitle,
  ChapterTitle,
  ExerciseTitle,
  getOptionLabel,
  parseDateTime,
  sortByIndex,
} from 'src/app/shared/common/functions';
import { emptyExerciseKeyFormRecord } from 'src/app/shared/state/exercises/exercise.model';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { ExerciseKeyState } from 'src/app/shared/state/exerciseKeys/exerciseKey.state';
import {
  FetchExerciseKeysAction,
  ResetExerciseKeyStateAction,
} from 'src/app/shared/state/exerciseKeys/exerciseKey.actions';
import { UploadService } from 'src/app/shared/api/upload.service';
import {
  DragDropComponent,
  DragDropInput,
} from 'src/app/shared/components/drag-drop/drag-drop.component';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
const startingExerciseFormOptions = ['', ''];
export type RubricCriterionType = {
  points: number;
  description: string;
};
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
export class ChapterDraftComponent implements OnInit, OnDestroy {
  resource = resources.CHAPTER;
  resourceActions = RESOURCE_ACTIONS;
  courseStatusOptions = CourseStatusOptions;
  chapterStatusOptions = ChapterStatusOptions;
  @Select(ChapterState.getChapterFormRecord)
  chapter$: Observable<Chapter>;
  chapter: Chapter;
  @Select(ExerciseKeyState.listExerciseKeys)
  exerciseKeys$: Observable<ExerciseKey[]>;
  exerciseKeys: ExerciseKey[] = [];
  @Select(ExerciseKeyState.isFetching)
  isFetchingExerciseKeys$: Observable<boolean>;
  isFetchingExerciseKeys: boolean;
  @Select(ChapterState.isFetching)
  isFetchingChapter$: Observable<boolean>;
  exerciseForm: FormGroup;
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
  tempPrompt = '';
  // Rubric related variables
  tempRubric = Object.assign([], this.startingRubric());
  pointsAccountedFor: number = 0;
  rubricComplete: boolean = false;
  showAddCriterion: boolean = false;
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
      this.exerciseKeys = sortByIndex(val, 'exercise.index');
      this.closeExerciseForm();
    });
    this.chapter$.subscribe((val) => {
      this.chapter = val;
      this.fetchExerciseKeys();
      this.setupExerciseForm();
    });
    this.formSubmitting$.subscribe((val) => {
      this.formSubmitting = val;
    });
    this.errorFetching$.subscribe((val) => {
      this.errorFetching = val;
    });
  }

  startingRubric(): RubricCriterionType[] {
    return Object.assign([], [{ points: null, description: '' }]);
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

  sanitizeRubric(rubric: any): RubricCriterionType[] {
    let sanitizedRubric = rubric;
    if (typeof rubric == 'string') {
      sanitizedRubric = JSON.parse(rubric);
    }
    return sanitizedRubric;
  }

  setupExerciseForm(
    exerciseKeyRecord: ExerciseKey = emptyExerciseKeyFormRecord
  ) {
    exerciseKeyRecord = this.sanitizeExerciseKeyRecord(exerciseKeyRecord);
    const exerciseForm = this.fb.group({
      id: [exerciseKeyRecord?.exercise?.id],
      prompt: [exerciseKeyRecord?.exercise?.prompt, Validators.required],
      index: [
        exerciseKeyRecord?.exercise?.index
          ? exerciseKeyRecord?.exercise?.index
          : this.exerciseKeys?.length + 1,
      ],
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
      remarks: [exerciseKeyRecord?.remarks],
      rubric: [
        exerciseKeyRecord?.exercise.rubric
          ? this.sanitizeRubric(exerciseKeyRecord.exercise.rubric)
          : this.startingRubric(),
      ],
    });
    this.tempPrompt = exerciseForm.get('prompt').value;
    this.tempRubric = exerciseForm.get('rubric').value;
    this.exerciseForm = exerciseForm;
    this.calibrateRubricVariables();
  }

  calibrateRubricVariables() {
    let pointsAccountedFor = 0;
    this.tempRubric?.forEach((c: RubricCriterionType) => {
      pointsAccountedFor += c?.points;
    });
    this.pointsAccountedFor = pointsAccountedFor;
    const exercisePoints = this.exerciseForm?.get('points').value;
    this.rubricComplete = pointsAccountedFor == exercisePoints ? true : false;
    this.showAddCriterion = pointsAccountedFor < exercisePoints;
  }

  parseDate(date) {
    return parseDateTime(date);
  }
  chapterTitle(chapter: Chapter): string {
    return ChapterTitle(chapter);
  }
  chapterSubtitle(chapter: Chapter): string {
    return ChapterSubtitle(chapter);
  }

  exerciseTitle(exercise: Exercise): string {
    return ExerciseTitle(this.chapter, exercise);
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
      queryParams: { id: this.chapter.id, courseId: this.chapter?.course?.id },
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
    this.setupExerciseForm(exerciseKey);
    this.showExerciseForm = true;
  }
  deleteExerciseConfirmation(key) {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the exercise "${key?.exercise?.prompt}"`,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteExercise(key);
      }
    });
  }
  deleteExercise(exerciseKey) {
    const exercise = exerciseKey?.exercise;
    this.store.dispatch(new DeleteExerciseAction({ id: exercise?.id }));
  }
  reorderExercises() {
    const exercisesList: DragDropInput[] = this.exerciseKeys.map((key) => {
      return { id: key.exercise.id, label: key.exercise.prompt };
    });
    const dialogRef = this.dialog.open(DragDropComponent, {
      data: exercisesList,
    });

    dialogRef.afterClosed().subscribe((newIndexArray) => {
      let i = 1;
      const reorderedList = newIndexArray.map((id) => {
        let exerciseKey = this.exerciseKeys.find(
          (key) => key.exercise.id == id
        );
        exerciseKey = {
          ...exerciseKey,
          exercise: { ...exerciseKey.exercise, index: i },
        };
        i++;
        return exerciseKey;
      });
      this.exerciseKeys = Object.assign([], reorderedList);

      const indexList = this.exerciseKeys.map((key) => {
        return { id: key.exercise?.id, index: key.exercise.index };
      });
      this.store.dispatch(new ReorderExercisesAction({ indexList }));
    });
  }
  addExercise() {
    this.resetExerciseForm();
    this.showExerciseForm = true;
  }
  resetExerciseForm() {
    this.setupExerciseForm();
    this.exerciseFormOptions = Object.assign([], startingExerciseFormOptions);
    this.imagesQueuedForUpload = [];
    this.exerciseKey = Object.assign({}, emptyExerciseKeyFormRecord);
    this.resetFormOptionErrors();
    this.tempPrompt = '';
  }

  closeExerciseForm() {
    this.resetExerciseForm();
    this.showExerciseForm = false;
  }

  trackByFn(index: any, item: any) {
    return index;
  }
  addCriterion() {
    const currentRubric = Object.assign([], this.tempRubric);
    const lastCriterion = currentRubric[currentRubric.length - 1];
    if (this.pointsAccountedFor < this.exerciseForm.get('points').value) {
      if (lastCriterion?.points && lastCriterion?.description) {
        const newTempRubric = this.tempRubric.concat(this.startingRubric());
        this.tempRubric = Object.assign([], newTempRubric);
        this.exerciseForm.get('rubric').setValue(this.tempRubric);
      } else {
        this.store.dispatch(
          new ShowNotificationAction({
            message: 'Please add a valid criterion description',
            action: 'error',
          })
        );
      }
    }
  }
  showRubric(question: Exercise): boolean {
    const typeChosen = question.questionType; // A question type is chosen
    const optionType = question.questionType == this.questionTypes.options; // The chosen question type is options
    const points = question.points > 0; // Must have some points
    return typeChosen && !optionType && points;
  }
  updateRubric(exercise: Exercise, index) {
    this.calibrateRubricVariables();
    const excessPoints = this.pointsAccountedFor - exercise.points;
    if (excessPoints > 0) {
      this.tempRubric[index].points =
        this.tempRubric[index].points - excessPoints;
    }
    this.rubricComplete =
      this.pointsAccountedFor == exercise.points ? true : false;
    this.showAddCriterion = this.pointsAccountedFor <= exercise.points;
  }
  removeCriterion(index) {
    this.tempRubric.splice(index, 1);
    this.exerciseForm.get('rubric').setValue(this.tempRubric);
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
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Uploading file',
        })
      );
      this.uploadService.upload(formData).subscribe(
        (res) => {
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
          const url = res.secure_url;

          const existingReferenceImages = form.get('referenceImages').value;
          // We update the referenceImages field in the form with the new url
          const newReferenceImages = existingReferenceImages.concat(url);
          form.get('referenceImages').setValue(newReferenceImages);
          // Checking if this is the final image to be uploaded..
          if (imageIndex == this.imagesQueuedForUpload.length - 1) {
            // if it is, then we update the form and submit it.
            this.submitExerciseForm(form);
          } else {
            this.store.dispatch(
              new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
            );
            imageIndex++;
            this.uploadImage(imageIndex, form);
          }
        },
        (err) => {
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
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
    this.uploadImage(0, form);
  }

  updateGradingKeyInExerciseForm(form) {
    // Populating the prompt of the question
    form.get('prompt').setValue(this.tempPrompt);
    form.get('validOption').setValue(this.exerciseKey.validOption);
    let allValidAnswers = this.exerciseKey?.validAnswers;
    allValidAnswers = allValidAnswers.filter((a) => a?.length > 0); // removing empty answers if any
    allValidAnswers = [...new Set(allValidAnswers)]; // removing duplicates
    form.get('validAnswers').setValue(allValidAnswers);
    form.get('referenceLink').setValue(this.exerciseKey.referenceLink);
    const referenceImages = this.exerciseKey.referenceImages;
    form.get('referenceImages').setValue(referenceImages);
    form.get('remarks').setValue(this.exerciseKey.remarks);
    if (this.imagesQueuedForUpload.length == 0) {
      this.submitExerciseForm(form);
    } else {
      this.uploadNewReferenceImages(form);
    }
  }

  updateExerciseFormOptions() {
    this.exerciseForm.get('options').setValue(this.exerciseFormOptions);
  }

  showQuestionTypeLabel(value) {
    return getOptionLabel(value, this.questionTypeOptions);
  }

  updateExerciseKeyOption(option) {
    let newExerciseKey = Object.assign({}, this.exerciseKey);
    newExerciseKey.validOption = option;
    this.exerciseKey = newExerciseKey;
  }

  addImageFileToSubmission(event) {
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

        this.imagesQueuedForUpload.push(previewImageObject);
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

  removePreviewImage(i) {
    this.imagesQueuedForUpload.splice(i, 1);
  }

  removeReferenceImage(i) {
    let newReferenceImages = Object.assign(
      [],
      this.exerciseKey.referenceImages
    );
    newReferenceImages.splice(i, 1);
    this.exerciseKey.referenceImages = newReferenceImages;
  }

  ngOnDestroy() {
    this.store.dispatch(new ResetExerciseKeyStateAction());
    this.store.dispatch(new ResetChapterFormAction());
  }

  updateFormBeforeSubmit(form, formDirective) {
    this.formDirective = formDirective;
    this.sanitizeAndUpdateOptions(form);
    this.updateGradingKeyInExerciseForm(form);
  }

  submitExerciseForm(form) {
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
