import { Component, Inject, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';
import {
  Chapter,
  ChapterStatusOptions,
  Exercise,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { ResetExerciseFormAction } from 'src/app/shared/state/exercises/exercise.actions';
import {
  GetChapterAction,
  ResetChapterFormAction,
} from 'src/app/shared/state/chapters/chapter.actions';
import { ResetExerciseSubmissionFormAction } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.actions';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

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
export class ChapterProfileComponent implements OnDestroy {
  resource = resources.CHAPTER;
  resourceActions = RESOURCE_ACTIONS;
  chapterStatusOptions = ChapterStatusOptions;
  @Select(ChapterState.getChapterFormRecord)
  chapter$: Observable<Chapter>;
  chapter: Chapter;
  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private auth: AuthorizationService
  ) {
    this.chapter$.subscribe((val) => {
      this.chapter = val;
    });
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const chapterId = params['id'];
      this.store.dispatch(new GetChapterAction({ id: chapterId }));
    });
  }
  showDraft() {
    // console.log(
    //   { chapter: this.chapter },
    //   'this.chapter.status == this.chapterStatusOptions.draft;',
    //   this.chapter.status == this.chapterStatusOptions.draft
    // );
    return (
      this.chapter.status == this.chapterStatusOptions.draft &&
      this.authorizeResourceMethod(this.resourceActions.CREATE)
    );
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }
  ngOnDestroy(): void {
    this.store.dispatch(new ResetExerciseFormAction());
    this.store.dispatch(new ResetChapterFormAction());
    this.store.dispatch(new ResetExerciseSubmissionFormAction());
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
