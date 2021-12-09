import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { filter } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  CurrentMember,
  IssueResourceTypeOptions,
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';

import { parseDateTime } from 'src/app/shared/common/functions';
import {
  GetMemberByUsernameAction,
  ResetPublicMemberFormAction,
} from '../../../state/public/public.actions';
import { PublicState } from '../../../state/public/public.state';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { getInstitutionProfileLink } from '../../../state/public/public.model';

export const COURSE_TAB_LABEL = 'Courses';
export const PROJECT_TAB_LABEL = 'Projects';
@Component({
  selector: 'app-public-user-profile',
  templateUrl: './public-user-profile.component.html',
  styleUrls: [
    './public-user-profile.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class PublicUserProfileComponent implements OnInit, OnDestroy {
  url: string = '';
  params: object = {};
  resource = resources.OWN_PROFILE;
  userDoesNotExist: boolean = false;
  resourceActions = RESOURCE_ACTIONS;

  tabs: string[] = [COURSE_TAB_LABEL, PROJECT_TAB_LABEL];
  activeTabIndex = 0;
  @Select(PublicState.getMemberFormRecord)
  member$: Observable<User>;
  member: any;
  courses: any = [];
  username: string = null;
  @Select(PublicState.isFetchingFormRecord)
  isFetchingFormRecord$: Observable<boolean>;

  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store
  ) {
    // subscribing to changes in the URL and refetching user from it.
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.url = event.url;
        this.fetchUserFromUrl();
      });
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.member$.subscribe((val) => {
      this.member = val;
      this.courses = this.member?.courses;
      if (!this.member?.name) {
        this.userDoesNotExist = true;
      } else {
        this.userDoesNotExist = false;
      }
    });
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

  ngOnInit(): void {
    this.url = window.location.href;
    this.fetchUserFromUrl();
  }

  fetchUserFromUrl() {
    if (this.router.url.includes(uiroutes.MEMBER_PROFILE_ROUTE.route)) {
      const usernameWithParams = this.url.split(
        uiroutes.MEMBER_PROFILE_ROUTE.route + '/'
      )[1];
      this.username = usernameWithParams.split('?')[0];
      if (
        this.username &&
        this.username != 'undefined' &&
        this.username != 'null'
      ) {
        this.store.dispatch(
          new GetMemberByUsernameAction({ username: this.username })
        );
      } else {
        this.userDoesNotExist = true;
      }
    }
  }

  parseDate(date) {
    return parseDateTime(date);
  }
  goBack() {
    this.location.back();
  }

  ownProfile(): boolean {
    return this.currentMember?.username == this.username;
  }

  editMember() {
    if (this.ownProfile()) {
      this.router.navigateByUrl(uiroutes.MEMBER_FORM_ROUTE.route);
    }
  }
  reportUser() {
    this.router.navigate([uiroutes.ISSUE_FORM_ROUTE.route], {
      queryParams: {
        resourceType: IssueResourceTypeOptions.user,
        resourceId: this.username,
        link: window.location.href,
      },
    });
  }
  onClickInstitution() {
    this.router.navigateByUrl(
      getInstitutionProfileLink(this.member.institution)
    );
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

  ngOnDestroy(): void {
    this.store.dispatch(new ResetPublicMemberFormAction());
  }
}
