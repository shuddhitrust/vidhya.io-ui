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
  ExerciseFileAttachment,
  ExerciseQuestionTypeOptions,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { FetchChaptersAction, FetchNextChaptersAction } from 'src/app/shared/state/chapters/chapter.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { ExerciseState } from 'src/app/shared/state/exercises/exercise.state';
import { CreateUpdateExerciseAction, FetchExercisesAction, FetchNextExercisesAction, ResetExerciseFormAction } from 'src/app/shared/state/exercises/exercise.actions';
import { autoGenOptions, getOptionLabel, parseDateTime } from 'src/app/shared/common/functions';
import { emptyExerciseFormRecord } from 'src/app/shared/state/exercises/exercise.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { emptyExerciseFileAttachmentFormRecord } from 'src/app/shared/state/exerciseFileAttachments/exerciseFileAttachment.model';


const startingExerciseFormOptions = [''];
const startingExerciseFormFiles: any[] = [emptyExerciseFileAttachmentFormRecord];
@Component({
  selector: 'app-chapter-profile',
  templateUrl: './chapter-profile.component.html',
  styleUrls: ['./chapter-profile.component.scss','./../../../shared/common/shared-styles.css'
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
  errorFetching$: Observable<boolean>
  errorFetching: boolean;
  questionTypes: any = ExerciseQuestionTypeOptions;
  questionTypeOptions: MatSelectOption[] = autoGenOptions(this.questionTypes);
  exerciseFormOptions: string[] = startingExerciseFormOptions;
  exerciseFormFiles: ExerciseFileAttachment[] = startingExerciseFormFiles;
  invalidOptions: boolean = false;
  formErrorMessages: string = '';
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
        console.log('Current chapter => ',  this.chapter)
        this.fetchExercises();
        this.exerciseForm = this.setupExerciseForm();
      });
      this.formSubmitting$.subscribe(val => {
        if(this.formSubmitting && !val && !this.errorFetching) {
          this.showExerciseForm = false;
        }
        this.formSubmitting = val;
      })
      this.errorFetching$.subscribe(val => {
        this.errorFetching = val;
        if(!this.errorFetching && !this.formSubmitting) {
          this.showExerciseForm = false;
        }
      })
  }

  setupExerciseForm(exerciseFormRecord: Exercise = emptyExerciseFormRecord) {
    return this.fb.group({
      id: [exerciseFormRecord?.id],
      prompt: [exerciseFormRecord?.prompt, Validators.required],
      chapter: [this.chapter?.id, Validators.required],
      questionType: [exerciseFormRecord?.questionType],
      points: [exerciseFormRecord?.points],
      required: [exerciseFormRecord?.required],
      options: [exerciseFormRecord?.options],
      files: [exerciseFormRecord?.files]
    });
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  chapterFilters() {
    return this.chapter?.id ? {chapterId: this.chapter?.id} : false;
  }

  fetchExercises() {
    if(this.chapterFilters()) {
      this.store.dispatch(
        new FetchExercisesAction({ searchParams: {...defaultSearchParams, newColumnFilters: this.chapterFilters()} })
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
  return this.exerciseFormOptions.length < 5 && this.exerciseFormOptions[this.exerciseFormOptions.length-1].length;
}

enableAddNewFile() {
  // Checking if the exercise form options is less than 5 options and if the last option was valid or not
  return this.exerciseFormFiles.length < 5 && this.exerciseFormOptions[this.exerciseFormOptions.length-1].length;
}

  addOption() {
    this.exerciseFormOptions = this.exerciseFormOptions.concat(['']);
  }

  addFile() {
    this.exerciseFormFiles = this.exerciseFormFiles.concat([emptyExerciseFileAttachmentFormRecord])
  }

  sanitizeAndUpdateOptions(form) {
    let options = null;
      if(form.get('questionType').value == this.questionTypes.options) {
      options = this.exerciseFormOptions.filter(o => o.length > 0);
      if(options.length < 2 ) {
        this.invalidOptions = true;
        if(!this.formErrorMessages.includes("Please fill in at least 2 options"))
        this.formErrorMessages = "Please fill in at least 2 options";
      }else {
        this.resetFormOptionErrors();
    }
    } else {
      this.resetFormOptionErrors();
    } 
    form.get('options').setValue(options);
  }

  resetFormOptionErrors() {
      this.invalidOptions = false;
      this.formErrorMessages = "";
  }

  submitExerciseForm(form, formDirective) {
    console.log('exercise submit form value => ', form.value);
    this.sanitizeAndUpdateOptions(form)
    if(!this.invalidOptions) {
      this.store.dispatch(
        new CreateUpdateExerciseAction({
          form,
          formDirective,
        })
      );
    } else {
      this.store.dispatch(new ShowNotificationAction({message: this.formErrorMessages, action: 'error'}))
    }
  }

  showQuestionTypeLabel(value) {
    return getOptionLabel(value, this.questionTypeOptions);
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
