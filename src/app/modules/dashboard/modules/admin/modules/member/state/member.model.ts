import {
  autoGenOptions,
  getOptionLabel,
  parseDateTime,
} from '../../../../../../../shared/common/functions';
import {
  FetchPolicy,
  MatSelectOption,
  MembershipStatusOptions,
  FetchParams,
  startingFetchParams,
  User,
} from '../../../../../../../shared/common/models';
import { uiroutes } from '../../../../../../../shared/common/ui-routes';

export interface MemberInput {
  id: Number;
  institution: Number;
  email: String;
  avatar: String;
  member: Number;
  title: String;
  bio: String;
  searchField: String;
}

export const emptyMemberFormRecord: User = {
  id: null,
  firstName: null,
  lastName: null,
  name: null,
  email: null,
  avatar: null,
  title: null,
  bio: null,
  role: null,
  institution: null,
};

export interface MemberStateModel {
  members: User[];
  membersSubscribed: boolean;
  lastPagePublicMembers: number;
  paginatedPublicMembers: any[];
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
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
  membersSubscribed: false,
  lastPagePublicMembers: null,
  paginatedPublicMembers: [],
  fetchPolicy: null,
  fetchParamObjects: [],
  memberFormId: null,
  memberFormRecord: emptyMemberFormRecord,
  isFetchingFormRecord: false,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const membershipStatusOptions: MatSelectOption[] = autoGenOptions(
  MembershipStatusOptions
); // autoGenOptions(MembershipStatusOptions);

export const memberColumns: any[] = [
  {
    field: 'name',
    cellRenderer: 'memberRenderer',
  },
  {
    field: 'role',
    cellRenderer: (params) => {
      return params?.data?.role?.name;
    },
  },
  {
    field: 'institution',
    cellRenderer: (params) => {
      return params?.data?.institution?.name;
    },
  },
  {
    field: 'membershipStatus',
    cellRenderer: (params) => {
      return getOptionLabel(params.value, membershipStatusOptions);
    },
  },
  // {
  //   field: 'lastActive',
  //   cellRenderer: (params) => {
  //     return parseDateTime(params.value);
  //   },
  //   tooltipField: 'lastActive',
  // },
];

export const MemberFormCloseURL = uiroutes.OWN_PROFILE_ROUTE.route;
