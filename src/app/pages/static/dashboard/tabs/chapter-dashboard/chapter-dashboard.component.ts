import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  Chapter,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchChaptersAction,
  FetchNextChaptersAction,
} from 'src/app/shared/state/chapters/chapter.actions';
import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';

@Component({
  selector: 'app-chapter-dashboard',
  templateUrl: './chapter-dashboard.component.html',
  styleUrls: [
    './chapter-dashboard.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class ChapterDashboardComponent implements OnInit {
  resource: string = resources.ANNOUNCEMENT;
  resourceActions = RESOURCE_ACTIONS;

  @Select(ChapterState.listChapters)
  chapters$: Observable<Chapter[]>;

  @Select(ChapterState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.store.dispatch(
      new FetchChaptersAction({ searchParams: defaultSearchParams })
    );
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  ngOnInit(): void {}
  onScroll() {
    console.log('scrolling groups');
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextChaptersAction());
    }
  }

  openChapter(chapter) {
    this.router.navigate([uiroutes.CHAPTER_PROFILE_ROUTE.route], {
      queryParams: { id: chapter.id },
    });
  }
}
