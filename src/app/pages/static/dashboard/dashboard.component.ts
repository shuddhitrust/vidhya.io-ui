import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { uiroutes } from '../../../shared/common/ui-routes';

const ADMIN = 'Admin';
const ANNOUNCEMENTS = 'Announcements';
const ASSIGNMENTS = 'Assignments';
const COURSES = 'Courses';
const GROUPS = 'Groups';
const REPORTS = 'Reports';

const tabIndexList = {
  0: ADMIN,
  1: ANNOUNCEMENTS,
  2: ASSIGNMENTS,
  3: COURSES,
  4: GROUPS,
  5: REPORTS,
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  activeTabIndex = 0;
  tabIndexList = tabIndexList;
  params: object = {};
  constructor(private route: ActivatedRoute, private router: Router) {}

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
