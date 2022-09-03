import { emptyInstitutionFormRecord } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.model';
import { emptyAnnouncementFormRecord } from 'src/app/modules/dashboard/modules/announcement/state/announcement.model';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchPolicyModel,
  FetchParams,
  User,
  Institution,
  Announcement,
  PublicCourse,
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

export const emptyPublicCourseFormRecord: PublicCourse = {
  id: null,
  title: null,
  blurb: null,
  description: null,
  instructor: null,
  mandatoryPrerequisites: [],
  recommendedPrerequisites: [],
  startDate: null,
  endDate: null,
  creditHours: null,
  createdAt: null,
  updatedAt: null,
}

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
  fetchParamNewsObjects: FetchParams[];  
  newsSubscribed: boolean;
  newsRecord: Announcement;
  isFetchingNews: boolean;
  // Courses
  courses: PublicCourse[];
  paginatedPublicCourses: any;
  lastPagePublicCourses: number;
  fetchCoursesParamObjects: FetchParams[];
  coursesSubscribed: boolean;
  courseRecord: PublicCourse;
  isFetchingCourses: boolean;
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
  fetchParamNewsObjects: [],
  newsRecord: emptyAnnouncementFormRecord,
  isFetchingNews: false,
  // Courses
  courses: [],
  paginatedPublicCourses: [],
  lastPagePublicCourses: null,
  fetchCoursesParamObjects: [],
  coursesSubscribed: false,
  courseRecord: emptyPublicCourseFormRecord,
  isFetchingCourses: false,
};

export const getMemberProfileLink = (member: User) => {
  return `${uiroutes.MEMBER_PROFILE_ROUTE.route}/${member.username}`;
};

export const getInstitutionProfileLink = (institution: Institution) => {
  return `${uiroutes.INSTITUTION_PROFILE_ROUTE.route}/${institution.code}`;
};
