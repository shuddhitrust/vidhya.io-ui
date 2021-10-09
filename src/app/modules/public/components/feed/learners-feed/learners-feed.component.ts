import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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
} from '../../../state/public/public.actions';
import { PublicState } from '../../../state/public/public.state';

@Component({
  selector: 'app-learners-feed',
  templateUrl: './learners-feed.component.html',
  styleUrls: ['./learners-feed.component.scss'],
})
export class PublicLearnersFeedComponent {
  @Select(PublicState.listMembers)
  learners$: Observable<User[]>;
  @Select(PublicState.isFetchingMembers)
  isFetchingMembers$: Observable<boolean>;
  isFetchingMembers: boolean = false;
  learners: any[] = [];
  learnerColumnFilters = {
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
          columnFilters: this.learnerColumnFilters,
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

  ngOnDestroy(): void {
    this.store.dispatch(new ResetPublicHomePageListsAction());
  }
}
