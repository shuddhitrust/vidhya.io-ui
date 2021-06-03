import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { User } from 'src/app/shared/common/models';

@Component({
  selector: 'app-own-profile',
  templateUrl: './own-profile.component.html',
  styleUrls: ['./own-profile.component.scss'],
})
export class OwnProfileComponent implements OnInit, OnDestroy {
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<User>;
  currentMember: User;

  constructor(private location: Location, private router: Router) {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
  }

  ngOnInit(): void {}

  goBack() {
    this.location.back();
  }

  editMember() {
    this.router.navigate([uiroutes.MEMBER_FORM_ROUTE]);
  }
  onClickInstitution() {
    this.router.navigate([uiroutes.INSTITUTION_PROFILE_ROUTE], {
      queryParams: { id: this.currentMember?.institution?.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  ngOnDestroy(): void {}
}
