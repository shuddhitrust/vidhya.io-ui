import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { clipLongText, parseDateTime } from 'src/app/shared/common/functions';
import {
  CurrentMember,
  Issue,
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchIssuesAction,
  FetchNextIssuesAction,
  ResetIssueFormAction,
} from '../../state/issue.actions';
import { IssueState } from '../../state/issue.state';

@Component({
  selector: 'app-own-issues',
  templateUrl: './own-issues.component.html',
  styleUrls: [
    './own-issues.component.scss',
    './../../../../../../../../shared/common/shared-styles.css',
  ],
})
export class OwnIssuesComponent implements OnInit {
  @Input() reporter: User = null;
  @Input() ownProfile: boolean = false;
  resource: string = resources.ISSUE;
  resourceActions = RESOURCE_ACTIONS;
  @Select(IssueState.listIssues)
  issues$: Observable<Issue[]>;

  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;

  @Select(IssueState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.fetchIssues();
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
  }
  ngOnChanges(changes) {
    if (changes.reporter) {
      this.reporter = changes.reporter.currentValue;
      this.fetchIssues();
    }
  }
  fetchIssues() {
    this.store.dispatch(
      new FetchIssuesAction({
        searchParams: {
          ...defaultSearchParams,
          columnFilters: { reporterId: this.currentMember.id },
        },
      })
    );
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  renderIssueSubtitle(issue: Issue) {
    let reporter = issue.reporter?.name ? issue.reporter.name : issue.guestName;
    return `Reported by ${reporter} at ${this.parseDate(issue.createdAt)}`;
  }

  clip(string) {
    return clipLongText(string, 200);
  }

  ngOnInit(): void {}
  onScroll() {
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextIssuesAction());
    }
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  createIssue() {
    this.store.dispatch(new ResetIssueFormAction());
    this.router.navigateByUrl(uiroutes.ISSUE_FORM_ROUTE.route);
  }

  openIssue(issue) {
    this.router.navigate([uiroutes.ISSUE_PROFILE_ROUTE.route], {
      queryParams: { id: issue.id },
    });
  }
}
