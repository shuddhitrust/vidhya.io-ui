import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  CurrentMember,
  defaultResourcePermissions,
  resources,
  RESOURCE_ACTIONS,
  UserPermissions,
} from '../../common/models';
import { Select } from '@ngxs/store';
import { USER_ROLES_NAMES } from '../../common/constants';
import { Observable } from 'rxjs';
import { AuthState } from 'src/app/modules/auth/state/auth.state';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  @Select(AuthState.getPermissions)
  permissions$: Observable<UserPermissions>;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  currentUserId: number;
  currentUserInsitutionId: number;
  currentMemberRoleName: string;
  permissions: UserPermissions;
  FILE_UPLOAD_ENDPOINT: string = environment.file_uplod_endpoint;
  constructor() {
    this.permissions$.subscribe((val) => {
      this.permissions = val;
    });
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
      this.currentUserId = this.currentMember?.id;
      this.currentUserInsitutionId = this.currentMember?.institution?.id;
      this.currentMemberRoleName = this.currentMember?.role?.name;
    });
  }

  public authorizeResource = (
    resource: string,
    action: string,
    recordData: { adminIds?: number[]; institutionId?: number } = {
      adminIds: null,
      institutionId: null,
    }
  ): boolean => {
    // console.log('from authorizeResource => ', {
    //   permissions: this.permissions,
    //   currentUserId: this.currentUserId,
    //   resource,
    //   action,
    //   adminIds: recordData.adminIds,
    //   institutionId: recordData.institutionId,
    //   currentUserInstitutionId: this.currentUserInsitutionId,
    // });
    const permissions = this.permissions;
    if (action == '*') {
      const resourceExists = resources[resource] ? true : false;
      const keys = resourceExists ? Object.keys(permissions[resource]) : [];
      for (let i = 0; i < keys.length; i++) {
        if (permissions[resource][keys[i]] == true) {
          return true;
        }
      }
      return false;
    } else {
      let recordConstraint = true;
      if (
        action == RESOURCE_ACTIONS.GET ||
        action == RESOURCE_ACTIONS.UPDATE ||
        action == RESOURCE_ACTIONS.DELETE
      ) {
        const { adminIds, institutionId } = recordData;
        if (
          this.currentMemberRoleName == USER_ROLES_NAMES.SUPER_ADMIN &&
          (resource == resources.MODERATION ||
            resource == resources.INSTITUTION)
        ) {
          // Super admin has the ability to moderate anyone
          recordConstraint = true;
        } else {
          if (adminIds) {
            recordConstraint = adminIds.includes(this.currentUserId);
          }
          if (institutionId) {
            recordConstraint = institutionId == this.currentUserInsitutionId;
          }
        }
      }
      const verdict =
        recordConstraint && permissions[resource]
          ? permissions[resource][action]
          : false;
      //
      return verdict;
    }
  };

  public convertPermissionsToTable = (
    permissionsObject: object = defaultResourcePermissions
  ): object[] => {
    let permissionsTableData = [];
    const permissionItems = Object.keys(permissionsObject);
    for (let i = 0; i < permissionItems.length; i++) {
      const resource = permissionItems[i];
      permissionsTableData[i] = {
        resource,
      };
      const resourceActions = Object.keys(RESOURCE_ACTIONS);
      for (let j = 0; j < resourceActions.length; j++) {
        const resourceAction = resourceActions[j];
        permissionsTableData[i] = {
          ...permissionsTableData[i],
          [resourceAction]:
            typeof permissionsObject[resource][resourceAction] == 'boolean'
              ? permissionsObject[resource][resourceAction]
              : false,
        };
      }
    }

    return permissionsTableData;
  };
}
