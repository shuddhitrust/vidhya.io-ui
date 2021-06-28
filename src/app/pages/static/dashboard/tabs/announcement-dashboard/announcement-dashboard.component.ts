import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { parseDateTime } from 'src/app/shared/common/functions';
import { Announcement } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { FetchAnnouncementsAction } from 'src/app/shared/state/announcements/announcement.actions';
import { AnnouncementState } from 'src/app/shared/state/announcements/announcement.state';

@Component({
  selector: 'app-announcement-dashboard',
  templateUrl: './announcement-dashboard.component.html',
  styleUrls: [
    './announcement-dashboard.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class AnnouncementDashboardComponent implements OnInit {
  @Select(AnnouncementState.listAnnouncements)
  announcements$: Observable<Announcement[]>;

  @Select(AnnouncementState.isFetching)
  isFetching$: Observable<boolean>;

  constructor(private store: Store, private router: Router) {
    this.store.dispatch(
      new FetchAnnouncementsAction({ searchParams: defaultSearchParams })
    );
  }

  ngOnInit(): void {}

  createAnnouncement() {
    this.router.navigateByUrl(uiroutes.ANNOUNCEMENT_FORM_ROUTE);
  }
  clip(string) {
    const clipLength = 50;
    return string.slice(0, clipLength);
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  openAnnouncement(announcement) {
    this.router.navigate([uiroutes.ANNOUNCEMENT_PROFILE_ROUTE], {
      queryParams: { id: announcement.id },
    });
  }
}
