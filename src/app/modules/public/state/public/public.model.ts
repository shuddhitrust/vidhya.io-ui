import {
  FetchPolicy,
  FetchParams,
  User,
} from '../../../../shared/common/models';

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

export interface PublicStateModel {
  members: User[];
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

export const defaultPublicState: PublicStateModel = {
  members: [],
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
