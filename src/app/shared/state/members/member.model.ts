import {
  autoGenOptions,
  getOptionLabel,
  parseDateTime,
} from '../../common/functions';
import {
  FetchPolicy,
  MatSelectOption,
  MembershipStatus,
  PaginationObject,
  startingPaginationObject,
  User,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

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
  membersSubscribed: false,
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

export const membershipStatusOptions: MatSelectOption[] =
  autoGenOptions(MembershipStatus); // autoGenOptions(MembershipStatus);

export const memberColumns: any[] = [
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

export const MemberFormCloseURL = uiroutes.MEMBER_PROFILE_ROUTE.route;
