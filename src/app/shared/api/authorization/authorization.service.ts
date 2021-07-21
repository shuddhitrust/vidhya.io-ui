import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  CurrentMember,
  resources,
  RESOURCE_ACTIONS,
  UserPermissions,
} from '../../common/models';
import { Observable } from '@apollo/client/utilities';
import { AuthState } from '../../state/auth/auth.state';
import { Select } from '@ngxs/store';
import { USER_ROLES_NAMES } from '../../common/constants';

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
      const keys = Object.keys(permissions[resource]);
      for (let i = 0; i < keys.length; i++) {
        if (permissions[resource][keys[i]] == true) {
          return true;
        }
      }
      return false;
    } else {
      let recordConstraint = true;
      if (
        action == RESOURCE_ACTIONS.UPDATE ||
        action == RESOURCE_ACTIONS.DELETE
      ) {
        const { adminIds, institutionId } = recordData;
        if (
          this.currentMemberRoleName == USER_ROLES_NAMES.SUPER_ADMIN &&
          resource == resources.MODERATION
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
      // console.log('VERDICT => ', { recordConstraint, verdict });
      return verdict;
    }
  };
}
