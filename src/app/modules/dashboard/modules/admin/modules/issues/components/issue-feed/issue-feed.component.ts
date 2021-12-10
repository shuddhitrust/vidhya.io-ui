import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  autoGenOptions,
  clipLongText,
  getOptionLabel,
  parseDateTime,
} from 'src/app/shared/common/functions';
import {
  Issue,
  IssueResourceTypeOptions,
  IssueStatusTypeOptions,
  MatSelectOption,
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
  selector: 'app-issue-feed',
  templateUrl: './issue-feed.component.html',
  styleUrls: [
    './issue-feed.component.scss',
    './../../../../../../../../shared/common/shared-styles.css',
  ],
})
export class IssueFeedComponent implements OnInit {
  @Input() reporterId: number = null;
  @Input() link: string = null;
  @Input() ownProfile: boolean = false;
  resource: string = resources.ISSUE;
  resourceActions = RESOURCE_ACTIONS;
  issueStatusFilter: string = null;
  groupByFilter: string = null;
  issueStatusOptions: MatSelectOption[] = autoGenOptions(
    IssueStatusTypeOptions
  );
  groupByOptions: MatSelectOption[] = autoGenOptions(IssueResourceTypeOptions);
  @Select(IssueState.listIssues)
  issues$: Observable<Issue[]>;

  @Select(IssueState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.issueStatusFilter = IssueStatusTypeOptions.pending;
    this.fetchIssues();
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
  }
  renderIssueStatus(status) {
    return getOptionLabel(status, this.issueStatusOptions);
  }
  ngOnChanges(changes) {
    let refetch = false;
    if (changes.reporterId) {
      this.reporterId = changes.reporterId.currentValue;
      refetch = true;
    }
    if (changes.link) {
      this.link = changes.link.currentValue;
      refetch = true;
    }
    if (refetch) {
      this.fetchIssues();
    }
  }
  fetchIssues() {
    this.store.dispatch(
      new FetchIssuesAction({
        searchParams: {
          ...defaultSearchParams,
          columnFilters: {
            status: this.issueStatusFilter,
            resourceType: this.groupByFilter,
            reporterId: this.reporterId,
            link: this.link,
          },
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
