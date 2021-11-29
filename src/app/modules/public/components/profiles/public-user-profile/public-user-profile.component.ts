import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  CurrentMember,
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
  resource = resources.OWN_PROFILE;
  userDoesNotExist: boolean = false;
  resourceActions = RESOURCE_ACTIONS;
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
    private store: Store
  ) {
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
  }

  ngOnInit(): void {
    this.url = window.location.href;
    if (this.router.url.includes(uiroutes.MEMBER_PROFILE_ROUTE.route)) {
      this.username = this.url.split(
        uiroutes.MEMBER_PROFILE_ROUTE.route + '/'
      )[1];
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

  allowProfileEdit() {
    return this.currentMember?.username == this.username;
  }

  editMember() {
    if (this.allowProfileEdit()) {
      this.router.navigateByUrl(uiroutes.MEMBER_FORM_ROUTE.route);
    }
  }
  onClickInstitution() {
    this.router.navigateByUrl(
      getInstitutionProfileLink(this.member.institution)
    );
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetPublicMemberFormAction());
  }
}
