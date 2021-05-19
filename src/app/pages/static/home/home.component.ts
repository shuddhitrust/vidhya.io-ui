import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthStateModel } from 'src/app/shared/state/auth/auth.model';
import { AuthState } from 'src/app/shared/state/auth/auth.state';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @Select(AuthState)
  authState$: Observable<AuthStateModel>;
  authState: AuthStateModel;
  pendingApproval: boolean = false;
  suspended: boolean = false;
  showAnnouncements: boolean = true;
  constructor() {
    this.authState$.subscribe((val) => {
      this.authState = val;
      // this.pendingApproval =
      //   this.authState.membershipStatus == MembershipStatus.PENDING_APPROVAL;
      // this.suspended =
      //   this.authState.membershipStatus == MembershipStatus.SUSPENDED;
      console.log('from the home page => ', {
        pendingApproval: this.pendingApproval,
        suspended: this.suspended,
      });
    });
  }

  closeAnnouncements() {
    console.log('clicked on close announcements');
    this.showAnnouncements = false;
  }

  ngOnInit(): void {}
}
