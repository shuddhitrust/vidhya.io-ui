import { Component, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ChapterState } from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.state';
import {
  Chapter,
  ChapterStatusOptions,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import {
  GetChapterAction,
  ResetChapterFormAction,
} from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.actions';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
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
    './../../../../../../../shared/common/shared-styles.css',
  ],
})
export class ChapterProfileComponent implements OnDestroy {
  resource = resources.CHAPTER;
  resourceActions = RESOURCE_ACTIONS;
  chapterStatusOptions = ChapterStatusOptions;
  @Select(ChapterState.getChapterFormRecord)
  chapter$: Observable<Chapter>;
  chapter: Chapter;
  @Select(ChapterState.isFetching)
  isFetchingChapter$: Observable<boolean>;
  isFetchingChapter: boolean;
  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private auth: AuthorizationService
  ) {
    this.isFetchingChapter$.subscribe((val) => {
      this.isFetchingChapter = val;
    });
    this.chapter$.subscribe((val) => {
      this.chapter = val;
    });
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const chapterId = params['id'];
      if (chapterId) {
        this.store.dispatch(
          new GetChapterAction({ id: chapterId, fetchFormDetails: false })
        );
      }
    });
  }
  showDraft() {
    return (
      this.chapter.status == this.chapterStatusOptions.draft &&
      this.authorizeResourceMethod(this.resourceActions.CREATE)
    );
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  ngOnDestroy() {
    this.store.dispatch(new ResetChapterFormAction());
  }
}
