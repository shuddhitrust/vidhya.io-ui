import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { LearnerColumnFilters } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';
import {
  defaultSearchParams,
  USER_ROLES_NAMES,
} from 'src/app/shared/common/constants';
import { MembershipStatusOptions } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchNewsAction,
  FetchPublicInstitutionssAction,
  FetchPublicMembersAction,
} from '../../state/public/public.actions';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

const NEWS_LABEL = 'News';
const SCHOOLS_LABEL = 'Institutions';
const STUDENTS_LABEL = 'Learners';
const COURSES_LABEL = 'Courses';

@Component({
  selector: 'app-public-lists',
  templateUrl: './public-lists.component.html',
  styleUrls: ['./public-lists.component.scss'],
})
export class PublicTabsComponent implements OnInit, OnDestroy {
  tabs = [NEWS_LABEL, COURSES_LABEL, SCHOOLS_LABEL, STUDENTS_LABEL];
  activeTabIndex = 0;
  params;
  News = NEWS_LABEL;
  Courses = COURSES_LABEL;
  Institutions = SCHOOLS_LABEL;
  Learners = STUDENTS_LABEL;
  draftSearchQuery: string = null;
  currentQuery: string = null;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.setActiveIndexFromParams();
    this.initiateGlobalSearch();
  }
  currentTab() {
    return this.tabs[this.activeTabIndex];
  }

  searchOrClear(): string {
    return this.draftSearchQuery == this.currentQuery &&
      this.draftSearchQuery != null
      ? 'close'
      : 'search';
  }

  fetchNews() {
    this.store.dispatch(
      new FetchNewsAction({
        searchParams: {
          ...defaultSearchParams,
          searchQuery: this.draftSearchQuery,
          pageSize: 10,
        },
      })
    );
  }

  fetchInstitutions() {
    this.store.dispatch(
      new FetchPublicInstitutionssAction({
        searchParams: {
          ...defaultSearchParams,
          searchQuery: this.draftSearchQuery,
          pageSize: 10,
          columnFilters: {},
        },
      })
    );
  }
  fetchMembers() {
    this.store.dispatch(
      new FetchPublicMembersAction({
        searchParams: {
          ...defaultSearchParams,
          searchQuery: this.draftSearchQuery,
          pageSize: 36,
          columnFilters: LearnerColumnFilters,
        },
      })
    );
  }
  fetchQueriesForTab() {
    const currentTab = this.currentTab();
    switch (currentTab) {
      case this.Institutions:
        this.fetchInstitutions();
        break;

      case this.News:
        this.fetchNews();
        break;

      case this.Learners:
        this.fetchMembers();
        break;

      default:
        this.fetchInstitutions();
        break;
    }
  }
  initiateGlobalSearch() {
    if (this.searchOrClear() == 'close') {
      this.draftSearchQuery = null;
    }
    this.currentQuery = this.draftSearchQuery; // Setting the draft query as the current qurey
    this.fetchQueriesForTab();
  }
  setActiveIndexFromParams() {
    this.route.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      this.params = params;
      const tabName = params['tab'];
      if (tabName) {
        const indexByParams = this.getIndexFromTabName(tabName);
        if (indexByParams === 'NaN') {
          this.router.navigateByUrl(uiroutes.DASHBOARD_ROUTE.route);
        }
        this.activeTabIndex = parseInt(indexByParams, 10);
        this.fetchQueriesForTab();
      } else {
        // If there are no tabname params, inject the available ones here.
        // Do this after authorization is implemented
      }
    });
  }

  onTabChange($event) {
    const tab = this.tabs[$event];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  getIndexFromTabName = (tabName: string): string => {
    const index = this.tabs.indexOf(tabName);

    return index?.toString();
  };

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
