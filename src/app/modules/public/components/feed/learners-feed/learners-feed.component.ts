import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { User } from 'src/app/shared/common/models';
import { generateMemberSubtitle } from 'src/app/shared/common/functions';
import { FetchNextPublicMembersAction } from '../../../state/public/public.actions';
import { PublicState } from '../../../state/public/public.state';
import { Router } from '@angular/router';
import { getMemberProfileLink } from '../../../state/public/public.model';

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
  constructor(
    private store: Store,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.learners$.subscribe((val) => {
      this.learners = val;
      // this.learners = tempUsers;
    });
  }

  generateLearnerSubtitle(user) {
    return generateMemberSubtitle(user);
  }

  onLearnerScroll() {
    this.store.dispatch(new FetchNextPublicMembersAction());
  }

  onClickLearnerCard(learner) {
    const link = getMemberProfileLink(learner);
    this.router.navigateByUrl(link);
  }
}
