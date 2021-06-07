import { USER_ROLES } from 'src/app/pages/static/dashboard/tabs/admin-dashboard/admin-dashboard.component';
import {
  autoGenOptions,
  getOptionLabel,
  parseDateTime,
} from '../../common/functions';
import {
  FetchPolicy,
  MatSelectOption,
  PaginationObject,
  startingPaginationObject,
  UserRole,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

export const defaultPermissions = {
  moderation: [],
  learners: [],
  class_admins: [],
  institution_admins: [],
  institution_members: [],
  institutions: [],
  announcements: [],
  courses: [],
  groups: [],
  reports: [],
  roles: [],
};

export const emptyUserRoleFormRecord: UserRole = {
  id: null,
  name: null,
  description: null,
  permissions: defaultPermissions,
};

export interface UserRoleStateModel {
  roles: UserRole[];
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  userRoleFormId: string;
  userRoleFormRecord: UserRole;
  isFetchingFormRecord: boolean;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultRoleState: UserRoleStateModel = {
  roles: [],
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  userRoleFormId: null,
  userRoleFormRecord: emptyUserRoleFormRecord,
  isFetchingFormRecord: false,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const UserRoleFormCloseURL =
  uiroutes.DASHBOARD_ROUTE + '?adminSection=' + USER_ROLES;
