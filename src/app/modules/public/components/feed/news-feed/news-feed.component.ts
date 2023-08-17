import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import {
  FetchNextProjectsAction,
  FetchProjectsAction,
} from 'src/app/modules/dashboard/modules/project/state/project.actions';
import { ProjectState } from 'src/app/modules/dashboard/modules/project/state/project.state';
import {
  defaultSearchParams,
  SORT_BY_OPTIONS,
} from 'src/app/shared/common/constants';
import {
  clipLongText,
  parseDate,
  parseDateTime,
} from 'src/app/shared/common/functions';
import { Announcement, Project } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchNewsAction,
  FetchNextNewsAction,
  ResetPublicHomePageListsAction,
} from '../../../state/public/public.actions';
import { PublicState } from '../../../state/public/public.state';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.scss'],
})
export class PublicNewsFeedComponent implements OnInit, OnDestroy {
  @Input() currentQuery: string = null;
  @Select(PublicState.listNews)
  news$: Observable<Announcement[]>;
  @Select(PublicState.isFetchingNews)
  isFetching$: Observable<boolean>;
  isFetching: boolean = false;
  news: any[] = [];
  @Select(ProjectState.listProjects)
  projects$: Observable<Project[]>;

  @Select(AuthState.projectsClapped)
  projectsClapped$: Observable<string[]>;
  projectsClapped: string[];

  sortByOptions = SORT_BY_OPTIONS;

  projectColumnFilters = {
    sortBy: SORT_BY_OPTIONS.TOP,
  };

  @Select(ProjectState.isFetching)
  isFetchingProjects$: Observable<boolean>;
  isFetchingProjects: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.news$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.news = val;
    });

    this.projectsClapped$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.projectsClapped = val;
    });

    this.isFetchingProjects$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isFetchingProjects = val;
    });

    this.fetchProjects();
    this.isFetching$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isFetching = val;
    });
  }

  ngOnInit() {
    this.fetchPublicAnnouncements();
  }

  onScroll() {
    if (!this.isFetchingProjects) {
      this.store.dispatch(new FetchNextProjectsAction());
    }
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
    return i == 0 ? 'row carousel-item active' : 'row carousel-item';
  }

  onClickNewsCard(news) {
    this.router.navigate([uiroutes.NEWS_PROFILE_ROUTE.route], {
      queryParams: { id: news.id },
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetPublicHomePageListsAction());    
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  fetchProjects() {
    this.store.dispatch(
      new FetchProjectsAction({
        searchParams: {
          ...defaultSearchParams,
          columnFilters: this.projectColumnFilters,
        },
      })
    );
  }

  renderProjectSubtitle(project: Project) {
    return `Published here on ${this.parseDate(project.createdAt)} by ${
      project.author.name
    }`;
  }

  clapButtonClass(id) {
    return this.projectsClapped?.includes(id)
      ? 'project-clap-button-clapped'
      : 'project-clap-button-unclapped';
  }

  projectSortButtonClass(sortOption) {
    return this.projectColumnFilters.sortBy == sortOption
      ? 'active-sort-button'
      : 'inactive-sort-button';
  }

  sortProjectFeed(sortOption) {
    sortOption =
      sortOption == this.sortByOptions.TOP
        ? this.sortByOptions.TOP
        : this.sortByOptions.NEW;
    this.projectColumnFilters = {
      sortBy: sortOption,
    };
    this.projectColumnFilters = {
      sortBy: sortOption,
    };
    this.fetchProjects();
  }

  openProject(project) {
    this.router.navigate([uiroutes.PROJECT_PROFILE_ROUTE.route], {
      queryParams: { id: project.id },
    });
  }
  
}
