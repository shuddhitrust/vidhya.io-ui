import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { uiroutes } from 'src/app/shared/common/ui-routes';

const SCHOOLS_LABEL = 'Institutions';
const STUDENTS_LABEL = 'Learners';

@Component({
  selector: 'app-public-lists',
  templateUrl: './public-lists.component.html',
  styleUrls: ['./public-lists.component.scss'],
})
export class PublicTabsComponent implements OnInit {
  tabs = [SCHOOLS_LABEL, STUDENTS_LABEL];
  activeTabIndex = 0;
  params;
  Institutions = SCHOOLS_LABEL;
  Learners = STUDENTS_LABEL;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {}

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
}
