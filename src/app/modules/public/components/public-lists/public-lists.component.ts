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
import {
  Institution,
  MembershipStatusOptions,
  User,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchNextPublicMembersAction,
  FetchPublicMembersAction,
  ResetPublicHomePageListsAction,
} from '../../state/public/public.actions';
import { PublicState } from '../../state/public/public.state';

const SCHOOLS_LABEL = 'Schools';
const STUDENTS_LABEL = 'Students';

@Component({
  selector: 'app-public-lists',
  templateUrl: './public-lists.component.html',
  styleUrls: ['./public-lists.component.scss'],
})
export class PublicLearnersTabComponent implements OnInit {
  tabs = [SCHOOLS_LABEL, STUDENTS_LABEL];
  activeTabIndex = 0;
  params;
  Schools = SCHOOLS_LABEL;
  Students = STUDENTS_LABEL;
  @Select(PublicState.listInstitutions)
  institutions$: Observable<Institution[]>;
  @Select(PublicState.listMembers)
  learners$: Observable<User[]>;
  @Select(PublicState.isFetchingMembers)
  isFetchingMembers$: Observable<boolean>;
  isFetchingMembers: boolean = false;
  learners: any[] = [];
  institutions: any[] = [];
  learnerColumnFilters = {
    roles: [
      USER_ROLES_NAMES.LEARNER,
      USER_ROLES_NAMES.CLASS_ADMIN_LEARNER,
      USER_ROLES_NAMES.INSTITUTION_ADMIN,
    ],
    membershipStatusIs: [MembershipStatusOptions.APPROVED],
  };
  constructor(
    private route: ActivatedRoute,
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

  generateInstitutionSubtitle(institution) {}

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

  fetchInstitutions() {}

  onLearnerScroll() {
    this.store.dispatch(new FetchNextPublicMembersAction());
  }

  onInstitutionScroll() {}

  onClickLearnerCard(learner) {
    this.router.navigateByUrl(
      `${uiroutes.MEMBER_PROFILE_ROUTE.route}/${learner.username}`
    );
  }

  onClickInstitutionCard(institution) {}

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
    console.log('from onTabChange', { event: $event });
    const tab = this.tabs[$event];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetPublicHomePageListsAction());
  }
  getIndexFromTabName = (tabName: string): string => {
    const index = this.tabs.indexOf(tabName);

    return index?.toString();
  };
}
