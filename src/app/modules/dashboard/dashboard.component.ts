import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { resourceUsage } from 'process';
import { Observable, Subject } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import {
  ADMIN_SECTION_LABELS,
  localStorageKeys,
} from 'src/app/shared/common/constants';
import {
  resources,
  RESOURCE_ACTIONS,
  UserPermissions,
} from 'src/app/shared/common/models';
import { InitiateSubscriptionsAction } from 'src/app/shared/state/subscriptions/subscriptions.actions';
import { uiroutes } from '../../shared/common/ui-routes';
import { AuthState } from '../auth/state/auth.state';
import { GetUnreadCountAction } from './state/dashboard.actions';
import { unreadCountType } from './state/dashboard.model';
import { DashboardState } from './state/dashboard.state';
import { takeUntil } from 'rxjs/operators';

export const ADMIN = 'Admin';
export const ANNOUNCEMENTS = 'Announcements';
export const ASSIGNMENTS = 'Assignments';
export const COURSES = 'Courses';
export const GROUPS = 'Groups';
export const GRADING = 'Grading';
export const REPORTS = 'Reports';

const tabIndexList = {
  0: ADMIN,
  1: ANNOUNCEMENTS,
  2: ASSIGNMENTS,
  3: COURSES,
  4: GROUPS,
  5: GRADING,
  6: REPORTS,
};

const adminEntities = [
  { value: resources.ISSUE, label: ADMIN_SECTION_LABELS.ISSUE },
  { value: resources.MODERATION, label: ADMIN_SECTION_LABELS.MODERATION },
  { value: resources.USER_ROLE, label: ADMIN_SECTION_LABELS.USER_ROLES },
  { value: resources.INSTITUTION, label: ADMIN_SECTION_LABELS.INSTITUTIONS },
  { value: resources.MEMBER, label: ADMIN_SECTION_LABELS.MEMBERS },
  {
    value: resources.INSTITUTION_ADMIN,
    label: ADMIN_SECTION_LABELS.INSTITUTION_ADMINS,
  },
  { value: resources.CLASS_ADMIN, label: ADMIN_SECTION_LABELS.CLASS_ADMINS },
  { value: resources.LEARNER, label: ADMIN_SECTION_LABELS.LEARNERS },
];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  ADMIN = ADMIN;
  ANNOUNCEMENTS = ANNOUNCEMENTS;
  ASSIGNMENTS = ASSIGNMENTS;
  COURSES = COURSES;
  GROUPS = GROUPS;
  GRADING = GRADING;
  REPORTS = REPORTS;
  activeTabIndex = 0;
  tabIndexList = tabIndexList;
  params: object = {};
  @Select(AuthState.getPermissions)
  permissions$: Observable<UserPermissions>;
  resources = resources;
  visibleTabs = [];
  @Select(DashboardState.getUnreadCount)
  unreadCount$: Observable<unreadCountType>;
  unreadCount: unreadCountType;

  @Select(AuthState.getIsFullyAuthenticated)
  isFullyAuthenticated$: Observable<boolean>;
  isFullyAuthenticated: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthorizationService,
    private store: Store
  ) {
    this.permissions$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.populateVisibleTabs();
    });
    this.unreadCount$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.unreadCount = val;
    });
    this.store.dispatch(new GetUnreadCountAction());

    this.isFullyAuthenticated$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      if (this.isFullyAuthenticated == false && val) {
        this.isFullyAuthenticated = val;
        if (this.isFullyAuthenticated) {
          // this.store.dispatch(
          //   new InitiateSubscriptionsAction({
          //     authorizeResource: this.auth.authorizeResource,
          //     isFullyAuthenticated: this.isFullyAuthenticated,
          //   })
          // );
        }
      }
    });
  }

  ngOnInit(): void {
    this.setActiveIndexFromParams();
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
      } else {
        // If there are no tabname params, inject the available ones here.
        // Do this after authorization is implemented
      }
    });
  }

  ngOnDestroy(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  populateVisibleTabs() {
    const keys = Object.keys(this.tabIndexList);
    const visibleTabKeys = keys.filter((index) => {
      const tab = this.tabIndexList[index];
      switch (tab) {
        case ADMIN:
          return this.processEntities().length;
        case ANNOUNCEMENTS:
          return this.authorizeResourceMethod(resources.ANNOUNCEMENT);
        case ASSIGNMENTS:
          return this.authorizeResourceMethod(
            resources.EXERCISE_SUBMISSION,
            RESOURCE_ACTIONS.CREATE
          );
        case COURSES:
          return this.authorizeResourceMethod(resources.COURSE);
        case GROUPS:
          return this.authorizeResourceMethod(resources.GROUP);
        case GRADING:
          return this.authorizeResourceMethod(resources.GRADING);
        case REPORTS:
          return this.authorizeResourceMethod(
            resources.REPORT,
            RESOURCE_ACTIONS.LIST
          );
        default:
          return false;
      }
    });
    this.visibleTabs = visibleTabKeys.map((key) => this.tabIndexList[key]);
    this.setActiveIndexFromParams();
  }

  processEntities(): any[] {
    let newEntities = adminEntities.filter((e) => {
      return this.authorizeResourceMethod(e.value);
    });
    return newEntities;
  }

  authorizeResourceMethod(resource, action = '*') {
    if (resource == resources.ISSUE) {
      return this.auth.authorizeResource(resource, RESOURCE_ACTIONS.LIST);
    } else {
      return this.auth.authorizeResource(resource, action);
    }
  }

  onTabChange($event) {
    const tab = this.visibleTabs[$event];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  getIndexFromTabName = (tabName: string): string => {
    const index = this.visibleTabs.indexOf(tabName);

    return index?.toString();
  };
}
