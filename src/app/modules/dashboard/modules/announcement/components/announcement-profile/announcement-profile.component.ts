import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteAnnouncementAction,
  GetAnnouncementAction,
  ResetAnnouncementFormAction,
} from 'src/app/shared/state/announcements/announcement.actions';
import { AnnouncementState } from 'src/app/shared/state/announcements/announcement.state';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
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

@Component({
  selector: 'app-announcement-profile',
  templateUrl: './announcement-profile.component.html',
  styleUrls: [
    './announcement-profile.component.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
})
export class AnnouncementProfileComponent implements OnInit, OnDestroy {
  resource = resources.ANNOUNCEMENT;
  resourceActions = RESOURCE_ACTIONS;
  @Select(AnnouncementState.getAnnouncementFormRecord)
  announcement$: Observable<Announcement>;
  announcement: Announcement;
  @Select(AnnouncementState.isFetching)
  isFetchingAnnouncement$: Observable<boolean>;

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private store: Store,
    private auth: AuthorizationService
  ) {
    this.announcement$.subscribe((val) => {
      this.announcement = val;
    });
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: [this.announcement?.author?.id],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const announcementId = params['id'];
      this.store.dispatch(new GetAnnouncementAction({ id: announcementId }));
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteAnnouncement();
      }
    });
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  deleteAnnouncement() {
    this.store.dispatch(
      new DeleteAnnouncementAction({ id: this.announcement.id })
    );
    this.goBack();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetAnnouncementFormAction());
  }
}
