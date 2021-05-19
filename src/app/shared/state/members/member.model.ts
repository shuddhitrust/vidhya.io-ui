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

export const emptyMemberFormRecord: User = {
  __typename: 'Member',
  id: null,
  name: null,
  type: null,
  title: null,
  bio: null,
  // membershipStatus: MembershipStatus.PENDING_REGISTRATION,
  institution: null,
  groups: null,
  // instructor: null,
  // assistant: null,
  // learner: null,
  lastLogin: null,
  createdAt: null,
  updatedAt: null,
};

export interface MemberStateModel {
  members: User[];
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  memberFormId: string;
  memberFormRecord: User;
  isFetchingFormRecord: boolean;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultMemberState: MemberStateModel = {
  members: [],
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  memberFormId: null,
  memberFormRecord: emptyMemberFormRecord,
  isFetchingFormRecord: false,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const userTypeOptions: MatSelectOption[] = []; // autoGenOptions(CognitoGroup);

export const membershipStatusOptions: MatSelectOption[] = []; // autoGenOptions(MembershipStatus);

export const memberColumns = [
  {
    field: 'name',
    cellRenderer: 'memberRenderer',
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
    field: 'membershipStatus',
    cellRenderer: (params) => {
      return getOptionLabel(params.value, membershipStatusOptions);
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
