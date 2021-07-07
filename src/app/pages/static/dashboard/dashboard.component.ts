import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from '@apollo/client/utilities';
import { Select } from '@ngxs/store';
import { authorizeResource } from 'src/app/shared/common/functions';
import { resources, UserPermissions } from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { uiroutes } from '../../../shared/common/ui-routes';
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
export const REPORTS = 'Reports';

const tabIndexList = {
  0: ADMIN,
  1: ANNOUNCEMENTS,
  2: ASSIGNMENTS,
  3: COURSES,
  4: GROUPS,
  5: REPORTS,
};

const adminEntities = [
  { value: resources.MODERATION, label: MODERATION_LABEL },
  { value: resources.USER_ROLES, label: USER_ROLES_LABEL },
  { value: resources.INSTITUTIONS, label: INSTITUTIONS_LABEL },
  { value: resources.MEMBERS, label: MEMBERS_LABEL },
  { value: resources.INSTITUTION_ADMINS, label: INSTITUTION_ADMINS_LABEL },
  { value: resources.CLASS_ADMINS, label: CLASS_ADMINS_LABEL },
  { value: resources.LEARNERS, label: LEARNERS_LABEL },
];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  activeTabIndex = 0;
  tabIndexList = tabIndexList;
  params: object = {};
  @Select(AuthState.getPermissions)
  permissions$: Observable<UserPermissions>;
  permissions: UserPermissions;
  entities: any[] = [];
  resources = resources;
  constructor(private route: ActivatedRoute, private router: Router) {
    this.permissions$.subscribe((val) => {
      this.permissions = val;
      this.entities = processEntities(this.permissions);
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const tabName = params['tab'];
      if (tabName) {
        const indexByParams = getIndexFromTabName(tabName);
        if (indexByParams === 'NaN') {
          this.router.navigateByUrl(uiroutes.DASHBOARD_ROUTE);
        }
        this.activeTabIndex = parseInt(indexByParams, 10);
      } else {
        // If there are no tabname params, inject the available ones here.
        // Do this after authorization is implemented
      }
    });
  }

  authorizeResourceMethod(resource) {
    return authorizeResource(this.permissions, resource, '*');
  }

  onTabChange($event) {
    const tabIndex = $event['index'];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: this.tabIndexList[tabIndex] },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}

const getIndexFromTabName = (tabName: string): string => {
  const tabIndexKeys = Object.keys(tabIndexList);
  let indexByParams = parseInt(
    tabIndexKeys.find((key) => {
      return tabIndexList[key] == tabName;
    })
  );

  return indexByParams.toString();
};

const processEntities = (permissions): any[] => {
  let newEntities = adminEntities.filter((e) => {
    console.log('from process entities => ', { e });
    return authorizeResource(permissions, e?.value, '*');
  });
  return newEntities;
};
