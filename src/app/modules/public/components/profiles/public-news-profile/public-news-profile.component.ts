import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
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
import { PublicState } from '../../../state/public/public.state';
import {
  GetNewsAction,
  ResetNewsProfileAction,
} from '../../../state/public/public.actions';
import { generateMemberProfileLink } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';

@Component({
  selector: 'app-public-news-profile',
  templateUrl: './public-news-profile.component.html',
  styleUrls: [
    './public-news-profile.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class NewsProfileComponent implements OnInit, OnDestroy {
  resource = resources.ANNOUNCEMENT;
  resourceActions = RESOURCE_ACTIONS;
  @Select(PublicState.getNewsRecord)
  newsRecord$: Observable<Announcement>;
  newsRecord: Announcement;
  @Select(PublicState.isFetchingNews)
  isFetching$: Observable<boolean>;

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private auth: AuthorizationService
  ) {
    this.newsRecord$.subscribe((val) => {
      this.newsRecord = val;
    });
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: [this.newsRecord?.author?.id],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const newsId = params['id'];
      if (newsId) {
        this.store.dispatch(
          new GetNewsAction({
            id: newsId,
          })
        );
      }
    });
  }

  goBack() {
    this.location.back();
  }

  deleteConfirmation() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the announcement titled "${this.newsRecord.title}"`,
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

  authorLink() {
    this.router.navigate([generateMemberProfileLink(this.newsRecord.author)]);
  }

  deleteAnnouncement() {
    this.store.dispatch(
      new DeleteAnnouncementAction({ id: this.newsRecord.id })
    );
    this.goBack();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetNewsProfileAction());
  }
}
