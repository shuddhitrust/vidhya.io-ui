import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  autoGenOptions,
  getOptionLabel,
} from 'src/app/shared/common/functions';
import {
  CurrentMember,
  Issue,
  IssueStatusTypeOptions,
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
  UpdateIssueStatusAction,
} from '../../state/issue.actions';
import { clipLongText, parseDateTime } from 'src/app/shared/common/functions';
import { Clipboard } from '@angular/cdk/clipboard';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { ImageDisplayDialog } from 'src/app/shared/components/image-display/image-display-dialog.component';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-issue-profile',
  templateUrl: './issue-profile.component.html',
  styleUrls: [
    './issue-profile.component.scss',
    './../../../../../../../../shared/common/shared-styles.css',
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
  issueStatusOptions = IssueStatusTypeOptions;
  remarks: string;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialog: MatDialog,
    private store: Store,
    private route: ActivatedRoute,
    private location: Location,
    public clipboard: Clipboard,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.issue$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.issue = val;
      if (!this.issue.link) {
        this.issueDoesNotExist = true;
      } else {
        this.issueDoesNotExist = false;
      }
    });
  }
  renderIssueSubtitle() {
    let reporter = this.issue.reporter?.name
      ? this.issue.reporter.name
      : this.issue.guestName;
    return `Reported by ${reporter} at ${this.parseDate(this.issue.createdAt)}`;
  }
  reporterLink() {
    if (this.issue.reporter?.id) {
      this.router.navigate([
        uiroutes.MEMBER_PROFILE_ROUTE.route +
          '/' +
          this.issue.reporter.username,
      ]);
    } else {
      this.clipboard.copy(this.issue.guestEmail);
      this.store.dispatch(
        new ShowNotificationAction({
          message: `This issue was reported by a non-registerd user. \n\n Their email ID (${this.issue.guestEmail}) has been copied to your clipboard`,
          action: 'success',
        })
      );
    }
  }
  showIssueActions() {
    return (
      this.authorizeResourceMethod(this.resourceActions.DELETE) &&
      this.issue.status == IssueStatusTypeOptions.pending
    );
  }
  parseDate(date) {
    return parseDateTime(date);
  }

  showExpandedImage(image) {
    const dialogRef = this.dialog.open(ImageDisplayDialog, {
      data: {
        image,
      },
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }

  renderStatusLabel(status) {
    return getOptionLabel(status, autoGenOptions(IssueStatusTypeOptions));
  }

  clip(string) {
    return clipLongText(string, 100);
  }
  fetchMemberOptions() {
    this.currentMember$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.currentMember = val;
    });
    this.store.dispatch(
      new FetchMemberOptionsByInstitution({
        memberInstitutionId: this.currentMember?.institution?.id,
      })
    );
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {});
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      const issueId = params['id'];

      this.store.dispatch(
        new GetIssueAction({ id: issueId, fetchFormDetails: false })
      );
    });
  }

  goBack() {
    this.location.back();
  }

  updateIssueStatus(status) {
    if (this.remarks) {
      const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
        title: 'Confirm status update?',
        message: `Are you sure you want to mark this issue as ${this.renderStatusLabel(
          status
        )}?`,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
      };
      const dialogRef = this.dialog.open(MasterConfirmationDialog, {
        data: masterDialogConfirmationObject,
      });

      dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
        if (result == true) {
          this.store.dispatch(
            new UpdateIssueStatusAction({
              id: this.issue.id,
              status,
              remarks: this.remarks,
            })
          );
        }
      });
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message: 'Please add remarks',
          action: 'error',
        })
      );
    }
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

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
      {
      }
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
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
