import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  clipLongText,
  parseDate,
  parseDateTime,
} from 'src/app/shared/common/functions';
import { Announcement } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchNewsAction,
  FetchNextNewsAction,
  ResetPublicHomePageListsAction,
} from '../../../state/public/public.actions';
import { PublicState } from '../../../state/public/public.state';

@Component({
  selector: 'app-news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.scss'],
})
export class PublicNewsFeedComponent implements OnInit {
  @Input() currentQuery: string = null;
  @Select(PublicState.listNews)
  news$: Observable<Announcement[]>;
  @Select(PublicState.isFetchingNews)
  isFetching$: Observable<boolean>;
  isFetching: boolean = false;
  news: any[] = [];
  constructor(
    private store: Store,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.news$.subscribe((val) => {
      this.news = val;
      // this.learners = tempUsers;
    });
  }

  ngOnInit() {
    this.fetchPublicAnnouncements();
  }

  fetchPublicAnnouncements() {
    this.store.dispatch(
      new FetchNewsAction({
        searchParams: {
          ...defaultSearchParams,
          pageSize: 36,
        },
      })
    );
  }

  onNewsScroll() {
    this.store.dispatch(new FetchNextNewsAction());
  }

  clip(string) {
    return clipLongText(string, 200);
  }

  parseDate(date) {
    return parseDate(date);
  }

  slideClass(i) {
    return i == 0 ? 'carousel-item active' : 'carousel-item';
  }

  onClickNewsCard(news) {
    this.router.navigate([uiroutes.NEWS_PROFILE_ROUTE.route], {
      queryParams: { id: news.id },
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetPublicHomePageListsAction());
  }
}
