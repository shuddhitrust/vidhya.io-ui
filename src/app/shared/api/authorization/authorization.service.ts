import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { RESOURCE_ACTIONS, UserPermissions } from '../../common/models';
import { Observable } from '@apollo/client/utilities';
import { AuthState } from '../../state/auth/auth.state';
import { Select } from '@ngxs/store';
import { InstitutionFormCloseURL } from '../../state/institutions/institution.model';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  @Select(AuthState.getPermissions)
  permissions$: Observable<UserPermissions>;
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number;
  @Select(AuthState.getCurrentMemberInstitutionId)
  currentUserInsitutionId$: Observable<number>;
  currentUserInsitutionId: number;
  permissions: UserPermissions;
  FILE_UPLOAD_ENDPOINT: string = environment.file_uplod_endpoint;
  constructor(private http: HttpClient) {
    this.permissions$.subscribe((val) => {
      this.permissions = val;
    });
    this.currentUserId$.subscribe((val) => {
      this.currentUserId = val;
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
        if (adminIds) {
          recordConstraint = adminIds.includes(this.currentUserId);
        }
        if (institutionId) {
          recordConstraint = institutionId == this.currentUserInsitutionId;
        }
      }

      return recordConstraint && permissions[resource]
        ? permissions[resource][action]
        : false;
    }
  };
}
