import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Announcement } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { FetchAnnouncements } from 'src/app/shared/state/announcements/announcement.actions';
import { AnnouncementState } from 'src/app/shared/state/announcements/announcement.state';

@Component({
  selector: 'app-announcement-dashboard',
  templateUrl: './announcement-dashboard.component.html',
  styleUrls: [
    './announcement-dashboard.component.scss',
    './../../../../../../app/shared/common/shared-styles.css',
  ],
})
export class AnnouncementDashboardComponent implements OnInit {
  @Select(AnnouncementState.listAnnouncements)
  announcements$: Observable<Announcement[]>;

  @Select(AnnouncementState.isFetching)
  isFetching$: Observable<boolean>;

  constructor(private store: Store, private router: Router) {
    this.store.dispatch(new FetchAnnouncements({}));
  }

  ngOnInit(): void {}

  createAnnouncement() {
    this.router.navigateByUrl(uiroutes.ANNOUNCEMENT_FORM_ROUTE);
  }

  openAnnouncement(announcement) {
    this.router.navigate([uiroutes.ANNOUNCEMENT_PROFILE_ROUTE], {
      queryParams: { id: announcement.id },
    });
  }
}
