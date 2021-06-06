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

export const emptyUserRoleFormRecord: UserRole = {
  id: null,
  name: null,
  description: null,
  permissions: {},
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

export const roleColumns = [
  {
    field: 'name',
  },
  {
    field: 'description',
  },
];

export const UserRoleFormCloseURL = uiroutes.USER_ROLE_PROFILE_ROUTE;
