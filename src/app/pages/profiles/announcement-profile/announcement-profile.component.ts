import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteAnnouncement,
  GetAnnouncement,
  ResetAnnouncementForm,
} from 'src/app/shared/state/announcements/announcement.actions';
import { AnnouncementState } from 'src/app/shared/state/announcements/announcement.state';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Announcement } from 'src/app/shared/common/models';

@Component({
  selector: 'app-announcement-profile',
  templateUrl: './announcement-profile.component.html',
  styleUrls: ['./announcement-profile.component.scss'],
})
export class AnnouncementProfileComponent implements OnInit, OnDestroy {
  @Select(AnnouncementState.announcementFormRecord)
  announcement$: Observable<Announcement>;
  announcement: Announcement;
  @Select(AnnouncementState.isFetchingFormRecord)
  isFetchingAnnouncement$: Observable<boolean>;

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private store: Store
  ) {
    this.announcement$.subscribe((val) => {
      this.announcement = val;
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const announcementId = params['id'];
      this.store.dispatch(new GetAnnouncement({ id: announcementId }));
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
  deleteAnnouncement() {
    console.log('payload before passing to action => ', {
      id: this.announcement.id,
    });
    this.store.dispatch(new DeleteAnnouncement({ id: this.announcement.id }));
    this.goBack();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetAnnouncementForm());
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
