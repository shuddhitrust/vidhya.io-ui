import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  defaultSearchParams,
  USER_ROLES_NAMES,
} from 'src/app/shared/common/constants';
import { generateMemberSubtitle } from 'src/app/shared/common/functions';
import { MembershipStatusOptions, User } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchNextPublicMembersAction,
  FetchPublicMembersAction,
  ResetPublicHomePageListsAction,
} from '../../state/public/public.actions';
import { PublicState } from '../../state/public/public.state';

@Component({
  selector: 'app-public-lists',
  templateUrl: './public-lists.component.html',
  styleUrls: ['./public-lists.component.scss'],
})
export class PublicLearnersTabComponent implements OnInit {
  isLoggedIn: boolean = false;
  firstTimeSetup: boolean = false;
  @Select(PublicState.listMembers)
  learners$: Observable<User[]>;
  @Select(PublicState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean = false;
  learners: any[] = [];
  columnFilters = {
    roles: [
      USER_ROLES_NAMES.LEARNER,
      USER_ROLES_NAMES.CLASS_ADMIN_LEARNER,
      USER_ROLES_NAMES.INSTITUTION_ADMIN,
    ],
    membershipStatusIs: [MembershipStatusOptions.APPROVED],
  };
  constructor(
    private store: Store,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.fetchMembers();
    this.learners$.subscribe((val) => {
      this.learners = val;
      // this.learners = tempUsers;
    });
  }

  generateLearnerSubtitle(user) {
    return generateMemberSubtitle(user);
  }

  fetchMembers() {
    this.store.dispatch(
      new FetchPublicMembersAction({
        searchParams: {
          ...defaultSearchParams,
          pageSize: 36,
          columnFilters: this.columnFilters,
        },
      })
    );
  }

  onLearnerScroll() {
    this.store.dispatch(new FetchNextPublicMembersAction());
  }

  onClickLearnerCard(learner) {
    this.router.navigateByUrl(
      `${uiroutes.MEMBER_PROFILE_ROUTE.route}/${learner.username}`
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.store.dispatch(new ResetPublicHomePageListsAction());
  }
}
