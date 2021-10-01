import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from '@apollo/client/utilities';
import { Select } from '@ngxs/store';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import {
  resources,
  RESOURCE_ACTIONS,
  UserPermissions,
} from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { uiroutes } from '../../shared/common/ui-routes';
import {
  CLASS_ADMINS_LABEL,
  INSTITUTIONS_LABEL,
  INSTITUTION_ADMINS_LABEL,
  LEARNERS_LABEL,
  MEMBERS_LABEL,
  MODERATION_LABEL,
  USER_ROLES_LABEL,
} from './tabs/admin-dashboard/admin-dashboard.component';

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
  { value: resources.MODERATION, label: MODERATION_LABEL },
  { value: resources.USER_ROLE, label: USER_ROLES_LABEL },
  { value: resources.INSTITUTION, label: INSTITUTIONS_LABEL },
  { value: resources.MEMBER, label: MEMBERS_LABEL },
  { value: resources.INSTITUTION_ADMIN, label: INSTITUTION_ADMINS_LABEL },
  { value: resources.CLASS_ADMIN, label: CLASS_ADMINS_LABEL },
  { value: resources.LEARNER, label: LEARNERS_LABEL },
];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.permissions$.subscribe((val) => {
      this.populateVisibleTabs();
    });
  }

  ngOnInit(): void {
    this.setActiveIndexFromParams();
  }
  setActiveIndexFromParams() {
    this.route.queryParams.subscribe((params) => {
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
          return this.authorizeResourceMethod(resources.REPORT);
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
    return this.auth.authorizeResource(resource, action);
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
