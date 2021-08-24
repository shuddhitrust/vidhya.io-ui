import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { resources } from 'src/app/shared/common/models';

export const MODERATION_LABEL = 'Moderation';
export const USER_ROLES_LABEL = 'User Roles';
export const INSTITUTIONS_LABEL = 'Institutions';
export const MEMBERS_LABEL = 'Members';
export const INSTITUTION_ADMINS_LABEL = 'Institution Admins';
export const CLASS_ADMINS_LABEL = 'Class Admins';
export const LEARNERS_LABEL = 'Learners';

const tabIndexList = {
  0: MODERATION_LABEL,
  1: USER_ROLES_LABEL,
  2: INSTITUTIONS_LABEL,
  3: MEMBERS_LABEL,
  4: INSTITUTION_ADMINS_LABEL,
  5: CLASS_ADMINS_LABEL,
  6: LEARNERS_LABEL,
};

const sectionParamKey = 'adminSection';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  @Input() params: object = {};
  opened: boolean = true;
  @Input() entities: any[] = [];
  activeTabIndex = 0;
  tabIndexList = tabIndexList;
  resources = resources;
  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthorizationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const paramSection = params[sectionParamKey];
      if (paramSection) {
        const tabIndexes = Object.keys(tabIndexList);
        const tab = tabIndexes.find(
          (index) => this.tabIndexList[index] == paramSection
        );
        this.activeTabIndex = parseInt(tab, 10);
      } else {
        // If there are no tabname params, inject the available ones here.
        // Do this after authorization is implemented
      }
    });
  }

  authorizeResourceMethod(resource) {
    return this.auth.authorizeResource(resource, '*');
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
