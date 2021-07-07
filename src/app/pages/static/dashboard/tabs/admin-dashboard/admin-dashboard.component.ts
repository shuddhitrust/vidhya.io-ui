import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from '@apollo/client/utilities';
import { Select } from '@ngxs/store';
import { authorizeResource } from 'src/app/shared/common/functions';
import { resources, UserPermissions } from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';

export const MODERATION_LABEL = 'Moderation';
export const USER_ROLES_LABEL = 'User Roles';
export const INSTITUTIONS_LABEL = 'Institutions';
export const MEMBERS_LABEL = 'Members';
export const INSTITUTION_ADMINS_LABEL = 'Institution Admins';
export const CLASS_ADMINS_LABEL = 'Class Admins';
export const LEARNERS_LABEL = 'Learners';

const sectionParamKey = 'adminSection';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  @Input() params: object = {};
  opened: boolean = true;
  @Input() entities: any[] = [];

  moderation: string = resources.MODERATION;
  userRoles: string = resources.USER_ROLES;
  institutions: string = resources.INSTITUTIONS;
  members: string = resources.MEMBERS;
  institutionAdmins: string = resources.INSTITUTION_ADMINS;
  classAdmins: string = resources.CLASS_ADMINS;
  learners: string = resources.LEARNERS;
  selectedEntity;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.selectedEntity = this.entities[0]?.value;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const paramSection = params[sectionParamKey];
      if (paramSection) {
        this.selectedEntity = paramSection;
      } else {
        // If there are no tabname params, inject the available ones here.
        // Do this after authorization is implemented
      }
    });
  }

  onSelectEntity(entity) {
    this.selectedEntity = entity;
    this.onSelectionChange();
  }

  onSelectionChange() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [sectionParamKey]: this.selectedEntity },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
