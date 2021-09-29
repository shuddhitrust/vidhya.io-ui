import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';
import { GetMemberByUsernameAction } from 'src/app/shared/state/members/member.actions';
import { MemberState } from 'src/app/shared/state/members/member.state';
import { parseDateTime } from 'src/app/shared/common/functions';

@Component({
  selector: 'app-public-user-profile',
  templateUrl: './public-user-profile.component.html',
  styleUrls: [
    './public-user-profile.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class PublicUserProfileComponent implements OnInit, OnDestroy {
  url: string = '';
  resource = resources.OWN_PROFILE;
  userDoesNotExist: boolean = false;
  resourceActions = RESOURCE_ACTIONS;
  @Select(MemberState.getMemberFormRecord)
  member$: Observable<User>;
  member: any;
  courses: any = [];
  username: string = null;

  constructor(
    private location: Location,
    private router: Router,
    private store: Store
  ) {
    this.member$.subscribe((val) => {
      this.member = val;
      this.courses = this.member?.courses;
      if (!this.member.name) {
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

  editMember() {
    this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route]);
  }
  onClickInstitution() {
    this.router.navigate([uiroutes.INSTITUTION_PROFILE_ROUTE.route], {
      queryParams: { id: this.member?.institution?.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  ngOnDestroy(): void {}
}
