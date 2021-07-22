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

@Component({
  selector: 'app-announcement-profile',
  templateUrl: './announcement-profile.component.html',
  styleUrls: ['./announcement-profile.component.scss'],
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
    const dialogRef = this.dialog.open(AnnouncementDeleteConfirmationDialog, {
      data: this.announcement,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('close dialog result for announcment => ', result);
      if (result == true) {
        this.deleteAnnouncement();
      }
    });
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  deleteAnnouncement() {
    console.log('payload before passing to action => ', {
      id: this.announcement.id,
    });
    this.store.dispatch(
      new DeleteAnnouncementAction({ id: this.announcement.id })
    );
    this.goBack();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetAnnouncementFormAction());
  }
}

@Component({
  selector: 'announcement-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.html',
})
export class AnnouncementDeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<AnnouncementDeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Announcement
  ) {}
}
