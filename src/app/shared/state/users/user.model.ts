import {
  autoGenOptions,
  getOptionLabel,
  parseDateTime,
  parseLastModified,
} from '../../common/functions';
import {
  FetchPolicy,
  MatSelectOption,
  PaginationObject,
  startingPaginationObject,
  User,
} from '../../common/models';

export interface UserInput {
  id: Number;
  user: Number;
  name: String;
  email: String;
  avatar: String;
  institution: Number;
  title: String;
  bio: String;
  searchField: String;
}

export const emptyUserFormRecord: User = {
  __typename: 'User',
  id: null,
  name: null,
  type: null,
  title: null,
  bio: null,
  // usershipStatus: UsershipStatus.PENDING_REGISTRATION,
  institution: null,
  groups: null,
  // instructor: null,
  // assistant: null,
  // learner: null,
  lastLogin: null,
  createdAt: null,
  updatedAt: null,
};

export interface UserStateModel {
  users: User[];
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  userFormId: string;
  userFormRecord: User;
  isFetchingFormRecord: boolean;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultUserState: UserStateModel = {
  users: [],
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  userFormId: null,
  userFormRecord: emptyUserFormRecord,
  isFetchingFormRecord: false,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const userTypeOptions: MatSelectOption[] = []; // autoGenOptions(CognitoGroup);

export const usershipStatusOptions: MatSelectOption[] = []; // autoGenOptions(UsershipStatus);

export const userColumns = [
  {
    field: 'name',
    cellRenderer: 'userRenderer',
  },
  {
    field: 'institution',
    cellRenderer: (params) => {
      return params.value.name;
    },
  },
  {
    field: 'type',
    cellRenderer: (params) => {
      return getOptionLabel(params.value, userTypeOptions);
    },
  },
  {
    field: 'usershipStatus',
    cellRenderer: (params) => {
      return getOptionLabel(params.value, usershipStatusOptions);
    },
  },
  {
    field: 'lastLogin',
    cellRenderer: (params) => {
      return parseDateTime(params.value);
    },
    tooltipField: 'lastLogin',
  },
];
