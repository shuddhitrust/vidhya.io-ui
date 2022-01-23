import { emptyInstitutionFormRecord } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.model';
import { emptyAnnouncementFormRecord } from 'src/app/modules/dashboard/modules/announcement/state/announcement.model';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchPolicyModel,
  FetchParams,
  User,
  Institution,
  Announcement,
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
  // News
  news: Announcement[];
  paginatedNews: any;
  lastNewsPage: number;
  newsSubscribed: boolean;
  fetchParamObjects: FetchParams[];
  newsRecord: Announcement;
  isFetchingNews: boolean;
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
  // News
  news: [],
  paginatedNews: [],
  lastNewsPage: null,
  newsSubscribed: false,
  fetchParamObjects: [],
  newsRecord: emptyAnnouncementFormRecord,
  isFetchingNews: false,
};

export const getMemberProfileLink = (member: User) => {
  return `${uiroutes.MEMBER_PROFILE_ROUTE.route}/${member.username}`;
};

export const getInstitutionProfileLink = (institution: Institution) => {
  return `${uiroutes.INSTITUTION_PROFILE_ROUTE.route}/${institution.code}`;
};
