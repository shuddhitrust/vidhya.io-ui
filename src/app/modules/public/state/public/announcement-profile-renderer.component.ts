import { Component, Input, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { DeleteAnnouncementAction } from 'src/app/modules/dashboard/modules/announcement/state/announcement.actions';
import { MatDialog } from '@angular/material/dialog';
import {
  Announcement,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { parseDateTime } from 'src/app/shared/common/functions';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { generateMemberProfileLink } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-announcement-profile-renderer',
  templateUrl: './announcement-profile-renderer.component.html',
  styleUrls: [
    './announcement-profile-renderer.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AnnouncementProfileRendererComponent implements OnDestroy{
  resource = resources.ANNOUNCEMENT;
  resourceActions = RESOURCE_ACTIONS;
  @Input()
  announcement: Announcement;
  @Input()
  isFetching$: Observable<boolean>;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private router: Router,
    private store: Store,
    private auth: AuthorizationService
  ) {}

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: [this.announcement?.author?.id],
    });
  }

  goBack() {
    this.location.back();
  }

  deleteConfirmation() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the announcement titled "${this.announcement.title}"`,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result == true) {
        this.deleteAnnouncement();
      }
    });
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  authorLink() {
    this.router.navigate([generateMemberProfileLink(this.announcement.author)]);
  }

  deleteAnnouncement() {
    this.store.dispatch(
      new DeleteAnnouncementAction({ id: this.announcement.id })
    );
    this.goBack();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
