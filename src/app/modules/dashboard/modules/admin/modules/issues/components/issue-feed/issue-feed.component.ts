import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
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
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-issue-feed',
  templateUrl: './issue-feed.component.html',
  styleUrls: [
    './issue-feed.component.scss',
    './../../../../../../../../shared/common/shared-styles.css',
  ],
})
export class IssueFeedComponent implements OnInit, OnDestroy {
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
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.issueStatusFilter = IssueStatusTypeOptions.pending;
    this.fetchIssues();
    this.isFetching$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
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

  statusIcon(issue): { icon: string; iconColor: string; tooltip: string } {
    let icon = null;
    let iconColor = null;
    let tooltip = '';
    switch (issue?.status) {
      case IssueStatusTypeOptions.pending:
        icon = 'new_releases';
        iconColor = 'var(--orange)';
        tooltip = 'This  issue is pending resolution';
        break;
      case IssueStatusTypeOptions.resolved:
        icon = 'done_all';
        iconColor = 'var(--green)';
        tooltip = `This issue was resolved`;
        break;
      case IssueStatusTypeOptions.duplicate:
        icon = 'dns';
        iconColor = 'var(--red)';
        tooltip = `This issue was marked as a duplicate`;
        break;
      case IssueStatusTypeOptions.no_action:
        icon = 'error';
        iconColor = 'var(--red)';
        tooltip = `This issue was marked as not needing any action`;
        break;
      default:
        break;
    }
    return { icon, iconColor, tooltip };
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
