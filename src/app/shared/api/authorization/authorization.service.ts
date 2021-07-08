import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserPermissions } from '../../common/models';
import { Observable } from '@apollo/client/utilities';
import { AuthState } from '../../state/auth/auth.state';
import { Select } from '@ngxs/store';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  @Select(AuthState.getPermissions)
  permissions$: Observable<UserPermissions>;
  permissions: UserPermissions;
  FILE_UPLOAD_ENDPOINT: string = environment.file_uplod_endpoint;
  constructor(private http: HttpClient) {
    this.permissions$.subscribe((val) => {
      this.permissions = val;
    });
  }

  public authorizeResource = (resource: string, action: string): boolean => {
    const permissions = this.permissions;
    if (action == '*') {
      const keys = Object.keys(permissions[resource]);
      console.log('authorizeResources => ', { keys });
      for (let i = 0; i < keys.length; i++) {
        console.log('permission[resource]', permissions[resource]);
        console.log('permission[resource][i]', permissions[resource][keys[i]]);
        if (permissions[resource][keys[i]] == true) {
          return true;
        }
      }
      return false;
    } else {
      console.log(
        'permissions[resource]',
        permissions[resource],
        {
          permissions,
          resource,
          action,
        },
        'permissions[resource][action]',
        permissions[resource][action]
      );

      return permissions[resource] ? permissions[resource][action] : false;
    }
  };
}
