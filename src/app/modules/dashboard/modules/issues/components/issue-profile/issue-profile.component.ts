import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  CurrentMember,
  Issue,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { FetchMemberOptionsByInstitution } from 'src/app/shared/state/options/options.actions';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { IssueState } from '../../state/issue.state';
import {
  DeleteIssueAction,
  GetIssueAction,
  ResetIssueFormAction,
} from '../../state/issue.actions';
import { clipLongText, parseDateTime } from 'src/app/shared/common/functions';

@Component({
  selector: 'app-issue-profile',
  templateUrl: './issue-profile.component.html',
  styleUrls: [
    './issue-profile.component.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
})
export class IssueProfileComponent implements OnInit, OnDestroy {
  resource = resources.ISSUE;
  resourceActions = RESOURCE_ACTIONS;
  @Select(IssueState.getIssueFormRecord)
  issue$: Observable<Issue>;
  issue: Issue;
  @Select(IssueState.isFetching)
  isFetchingIssue$: Observable<boolean>;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  issueDoesNotExist: boolean;
  memberRows: any[] = [];
  constructor(
    public dialog: MatDialog,
    private store: Store,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.issue$.subscribe((val) => {
      this.issue = val;
      if (!this.issue.link) {
        this.issueDoesNotExist = true;
      } else {
        this.issueDoesNotExist = false;
      }
    });
  }
  renderIssueSubtitle(issue: Issue) {
    return `Published here on ${this.parseDate(issue.createdAt)}`;
  }
  parseDate(date) {
    return parseDateTime(date);
  }

  clip(string) {
    return clipLongText(string, 100);
  }
  fetchMemberOptions() {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.store.dispatch(
      new FetchMemberOptionsByInstitution({
        memberInstitutionId: this.currentMember?.institution?.id,
      })
    );
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: [this.issue?.reporter?.id],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const issueId = params['id'];

      this.store.dispatch(
        new GetIssueAction({ id: issueId, fetchFormDetails: false })
      );
    });
  }

  goBack() {
    this.location.back();
  }

  editIssue() {
    this.router.navigate([uiroutes.ISSUE_FORM_ROUTE.route], {
      queryParams: { id: this.issue.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
  deleteConfirmation() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the issue for "${this.issue.link}"`,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteIssue();
      }
    });
  }
  deleteIssue() {
    this.store.dispatch(new DeleteIssueAction({ id: this.issue.id }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetIssueFormAction());
  }
}
