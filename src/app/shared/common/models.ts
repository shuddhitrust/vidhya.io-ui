import { defaultPageSize } from '../abstract/master-grid/table.model';
import { defaultSearchParams } from './constants';

/* 
This is an object that requires an id of type string
to be used in NGXS actions
*/
export type idPayload = {
  id: number;
};

/*
Fetch policy to be used when making Graphql queries via AWS Amplify Client
*/
export type FetchPolicy =
  | 'cache-first'
  | 'cache-and-network'
  | 'network-only'
  | 'cache-only'
  | 'no-cache'
  | 'standby';

export type HotToastPositionOptions =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type HotToastStatus =
  | 'show'
  | 'success'
  | 'warning'
  | 'error'
  | 'loading';

export type MatSelectOption = { label: string; value: number | string };

export type Chat = {
  id: number;
  chatType: string;
  group: Group;
  individualMemberOne: User;
  individualMemberTwo: User;
  chatmessageSet: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  id: number;
  message: string;
  author: {
    id: number;
    firstName: string;
    avatar: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type FetchParams = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  offset: number; // the number of records in all pages prior to current page combined
  searchQuery: string;
};

export const startingFetchParams: FetchParams = {
  currentPage: 1,
  totalCount: 0,
  pageSize: defaultPageSize,
  offset: 0,
  searchQuery: defaultSearchParams.newSearchQuery,
};

export type CurrentMember = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  invitecode?: string;
  institution?: { id: number; name: string };
  membershipStatus: string;
  role: { name?: string; permissions: UserPermissions };
  createdAt?: string;
  updatedAt?: string;
};

export const SUBSCRIPTION_METHODS = {
  CREATE_METHOD: 'CREATE',
  UPDATE_METHOD: 'UPDATE',
  DELETE_METHOD: 'DELETE',
};

export const ChatTypes = {
  INDIVIDUAL: 'IL',
  GROUP: 'GP',
};

export const MembershipStatus = {
  UNINITIALIZED: 'UI',
  PENDING: 'PE',
  APPROVED: 'AP',
  SUSPENDED: 'SU',
};

export type User = {
  id?: number;
  username?: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  institution?: any;
  invitecode?: string;
  title?: string;
  bio?: string;
  role: { name?: string; permissions: UserPermissions };
  createdAt?: string;
  updatedAt?: string;
};

export const LIST = 'LIST';
export const GET = 'GET';
export const CREATE = 'CREATE';
export const UPDATE = 'UPDATE';
export const DELETE = 'DELETE';

export type UserRole = {
  id?: number;
  name: string;
  description: string;
  permissions: object;
  createdAt?: string;
  updatedAt?: string;
};

export type Announcement = {
  id: number;
  title: string;
  author: User;
  message: string;
  institution: Institution;
  groups: Group[];
  createdAt?: string;
  updatedAt?: string;
};

export type Group = {
  id: number;
  avatar: string;
  name: string;
  description: string;
  institution: {
    id: number;
  };
  members: User[];
  admins: User[];
  groupType: string;
  createdAt?: string;
  updatedAt?: string;
};

export const GroupType = {
  class: 'CL',
  team: 'TE',
  coordination: 'CO',
};

export type Institution = {
  id: number;
  name: string;
  location?: string;
  city?: string;
  website?: string;
  phone?: string;
  logo?: string;
  bio?: string;
  invitecode?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Course = {
  id: number;
  title: string;
  description: String;
  instructor: User;
  institutions: Institution[];
  createdAt?: string;
  updatedAt?: string;
};

export type Assignment = {
  id: number;
  title: string;
  instructions: string;
  course: Course;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatSearchResult = {
  title: string;
  subtitle: string;
  avatar: string;
  chatId: number;
  userId: number;
};

export const RESOURCE_ACTIONS = {
  LIST: 'LIST',
  GET: 'GET',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

type ResourceActions = {
  LIST: boolean;
  GET: boolean;
  CREATE: boolean;
  UPDATE: boolean;
  DELETE: boolean;
};

export type UserPermissions = {
  MODERATION: ResourceActions;
  LEARNERS: ResourceActions;
  CLASS_ADMINS: ResourceActions;
  MEMBERS: ResourceActions;
  INSTITUTION_ADMINS: ResourceActions;
  INSTITUTION_MEMBERS: ResourceActions;
  INSTITUTIONS: ResourceActions;
  ANNOUNCEMENTS: ResourceActions;
  ASSIGNMENTS: ResourceActions;
  COURSES: ResourceActions;
  GROUPS: ResourceActions;
  REPORTS: ResourceActions;
  USER_ROLES: ResourceActions;
  OWN_PROFILE: ResourceActions;
};

const defaultActions: ResourceActions = {
  LIST: true,
  GET: true,
  CREATE: true,
  UPDATE: true,
  DELETE: true,
};

export const resources = {
  MODERATION: 'MODERATION',
  LEARNERS: 'LEARNERS',
  CLASS_ADMINS: 'CLASS_ADMINS',
  MEMBERS: 'MEMBERS',
  INSTITUTION_ADMINS: 'INSTITUTION_ADMINS',
  INSTITUTION_MEMBERS: 'INSTITUTION_MEMBERS',
  INSTITUTIONS: 'INSTITUTIONS',
  ANNOUNCEMENTS: 'ANNOUNCEMENTS',
  ASSIGNMENTS: 'ASSIGNMENTS',
  COURSES: 'COURSES',
  GROUPS: 'GROUPS',
  REPORTS: 'REPORTS',
  USER_ROLES: 'USER_ROLES',
  OWN_PROFILE: 'OWN_PROFILE',
};

export const defaultResourcePermissions: UserPermissions = {
  MODERATION: defaultActions,
  LEARNERS: defaultActions,
  CLASS_ADMINS: defaultActions,
  MEMBERS: defaultActions,
  INSTITUTION_ADMINS: defaultActions,
  INSTITUTION_MEMBERS: defaultActions,
  INSTITUTIONS: defaultActions,
  ANNOUNCEMENTS: defaultActions,
  ASSIGNMENTS: defaultActions,
  COURSES: defaultActions,
  GROUPS: defaultActions,
  REPORTS: defaultActions,
  USER_ROLES: defaultActions,
  OWN_PROFILE: defaultActions,
};
