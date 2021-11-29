import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { clipLongText, parseDateTime } from 'src/app/shared/common/functions';
import {
  Announcement,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchAnnouncementsAction,
  FetchNextAnnouncementsAction,
  MarkAllAnnouncementsSeenAction,
} from 'src/app/modules/dashboard/modules/announcement/state/announcement.actions';
import { AnnouncementState } from 'src/app/modules/dashboard/modules/announcement/state/announcement.state';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-announcement-dashboard',
  templateUrl: './announcement-dashboard.component.html',
  styleUrls: [
    './announcement-dashboard.component.scss',
    '../../../../../../../../src/app/shared/common/shared-styles.css',
  ],
})
export class AnnouncementDashboardComponent implements OnInit {
  resource: string = resources.ANNOUNCEMENT;
  resourceActions = RESOURCE_ACTIONS;

  @Select(AnnouncementState.listAnnouncements)
  announcements$: Observable<Announcement[]>;

  @Select(AnnouncementState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;
  @Select(OptionsState.listGroupAdminOptions)
  groupOptions$: Observable<MatSelectOption[]>;
  adminGroups = [];
  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private auth: AuthorizationService
  ) {
    this.groupOptions$.subscribe((val) => {
      this.adminGroups = val;
    });
    this.store.dispatch(
      new FetchAnnouncementsAction({ searchParams: defaultSearchParams })
    );
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
  }

  showAnnouncementCreateOption() {
    return (
      this.authorizeResourceMethod(this.resourceActions.CREATE) ||
      this.adminGroups.length
    );
  }

  ngOnInit(): void {}
  markAllAsSeen() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm action?',
      message: `Are you sure you want to mark all the announcements as seen?`,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.store.dispatch(new MarkAllAnnouncementsSeenAction());
      }
    });
  }
  onScroll() {
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextAnnouncementsAction());
    }
  }

  createAnnouncement() {
    this.router.navigateByUrl(uiroutes.ANNOUNCEMENT_FORM_ROUTE.route);
  }
  clip(string) {
    return clipLongText(string, 200);
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  openAnnouncement(announcement) {
    this.router.navigate([uiroutes.ANNOUNCEMENT_PROFILE_ROUTE.route], {
      queryParams: { id: announcement.id },
    });
  }
}
