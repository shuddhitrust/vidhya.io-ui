import { emptyInstitutionFormRecord } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.model';
import {
  FetchPolicyModel,
  FetchParams,
  User,
  Institution,
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
  fetchPolicy: FetchPolicyModel;
  fetchMembersParamObjects: FetchParams[];
  memberFormId: string;
  memberFormRecord: User;
  isFetchingFormRecord: boolean;
  isFetchingMembers: boolean;
  // Institutions
  institutions: Institution[];
  lastPagePublicInstitutions: number;
  paginatedPublicInstitutions: any[];
  fetchInstitutionsParamObjects: FetchParams[];
  institutionFormId: string;
  institutionFormRecord: Institution;
  isFetchingInstitutions: boolean;
}

export const defaultPublicState: PublicStateModel = {
  members: [],
  lastPagePublicMembers: null,
  paginatedPublicMembers: [],
  fetchPolicy: null,
  fetchMembersParamObjects: [],
  memberFormId: null,
  memberFormRecord: emptyMemberFormRecord,
  isFetchingFormRecord: false,
  isFetchingMembers: false,
  // Institutions
  institutions: [],
  lastPagePublicInstitutions: null,
  paginatedPublicInstitutions: [],
  fetchInstitutionsParamObjects: [],
  institutionFormId: null,
  institutionFormRecord: emptyInstitutionFormRecord,
  isFetchingInstitutions: false,
};
