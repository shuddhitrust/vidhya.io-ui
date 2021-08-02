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
import { autoGenOptions, parseDateTime } from 'src/app/shared/common/functions';
import { emptyExerciseFormRecord } from 'src/app/shared/state/exercises/exercise.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 
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
  questionTypes: any = ExerciseQuestionTypeOptions;
  questionTypeOptions: MatSelectOption[] = autoGenOptions(this.questionTypes);
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
  }

  setupExerciseForm(exerciseFormRecord: Exercise = emptyExerciseFormRecord) {
    return this.fb.group({
      id: [exerciseFormRecord?.id],
      prompt: [exerciseFormRecord?.prompt, Validators.required],
      chapter: [this.chapter?.id, Validators.required],
      questionType: [exerciseFormRecord?.questionType],
      points: [exerciseFormRecord?.points],
      required: [true],
      options: [exerciseFormRecord?.options]
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
  addExercise() {
    this.showExerciseForm = true;
    console.log('exercise form value ', this.exerciseForm.value)
  }

  submitExerciseForm(form, formDirective) {
    console.log('exercise submit form value => ', form.value);
    this.store.dispatch(
      new CreateUpdateExerciseAction({
        form,
        formDirective,
      })
    );
    this.showExerciseForm = false;
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
