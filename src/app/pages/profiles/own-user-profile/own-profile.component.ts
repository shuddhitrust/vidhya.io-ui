import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import {
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';

@Component({
  selector: 'app-own-profile',
  templateUrl: './own-profile.component.html',
  styleUrls: ['./own-profile.component.scss'],
})
export class OwnProfileComponent implements OnInit, OnDestroy {
  resource = resources.OWN_PROFILE;
  resourceActions = RESOURCE_ACTIONS;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<User>;
  currentMember: User;

  constructor(
    private location: Location,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: [this.currentMember.id],
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
