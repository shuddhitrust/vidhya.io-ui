import { Component, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';
import {
  Chapter,
  ChapterStatusOptions,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { ResetExerciseFormAction } from 'src/app/shared/state/exercises/exercise.actions';
import { ResetChapterFormAction } from 'src/app/shared/state/chapters/chapter.actions';
import { ResetExerciseSubmissionFormAction } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.actions';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';

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
  constructor(private store: Store, private auth: AuthorizationService) {
    this.chapter$.subscribe((val) => {
      this.chapter = val;
    });
  }
  showDraft() {
    console.log(
      { chapter: this.chapter },
      'this.chapter.status == this.chapterStatusOptions.draft;',
      this.chapter.status == this.chapterStatusOptions.draft
    );
    return this.chapter.status == this.chapterStatusOptions.draft;
  }
  authorizeResourceMethod(action) {
    console.log(
      'this.auth.authorizeResource(this.resource, action);',
      this.auth.authorizeResource(this.resource, action)
    );
    return this.auth.authorizeResource(this.resource, action);
  }
  ngOnDestroy(): void {
    this.store.dispatch(new ResetExerciseFormAction());
    this.store.dispatch(new ResetChapterFormAction());
    this.store.dispatch(new ResetExerciseSubmissionFormAction());
  }
}
