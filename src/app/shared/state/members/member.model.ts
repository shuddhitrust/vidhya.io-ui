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
  User,
} from '../../common/models';

export interface MemberInput {
  id: Number;
  institution: Number;
  nickName: String;
  email: String;
  avatar: String;
  member: Number;
  title: String;
  bio: String;
  searchField: String;
}

export const emptyMemberFormRecord: User = {
  id: null,
  nickName: null,
  email: null,
  avatar: null,
  title: null,
  bio: null,
  institution: null,
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

export const memberTypeOptions: MatSelectOption[] = []; // autoGenOptions(CognitoGroup);

export const membershipStatusOptions: MatSelectOption[] = []; // autoGenOptions(MembershipStatus);

export const memberColumns = [
  {
    field: 'nickName',
    cellRenderer: 'memberRenderer',
  },
  {
    field: 'firstName',
  },
  {
    field: 'lastName',
  },
  {
    field: 'membershipStatus',
    cellRenderer: (params) => {
      return getOptionLabel(params.value, membershipStatusOptions);
    },
  },
  {
    field: 'lastActive',
    cellRenderer: (params) => {
      return parseDateTime(params.value);
    },
    tooltipField: 'lastActive',
  },
];
