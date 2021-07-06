import { defaultPageSize } from '../abstract/master-grid/table.model';

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

export type PaginationObject = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  offset: number; // the number of records in all pages prior to current page combined
  searchQuery: string;
};

export const startingPaginationObject: PaginationObject = {
  currentPage: 1,
  totalCount: defaultPageSize,
  pageSize: defaultPageSize,
  offset: 0,
  searchQuery: '',
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

type ResourceActions = {
  VIEW: boolean;
  CREATE: boolean;
  UPDATE: boolean;
  DELETE: boolean;
};

export type UserPermissions = {
  MODERATION: ResourceActions;
  LEARNERS: ResourceActions;
  CLASS_ADMINS: ResourceActions;
  INSTITUTION_ADMINS: ResourceActions;
  INSTITUTION_MEMBERS: ResourceActions;
  INSTITUTIONS: ResourceActions;
  ANNOUNCEMENTS: ResourceActions;
  COURSES: ResourceActions;
  GROUPS: ResourceActions;
  REPORTS: ResourceActions;
  ROLES: ResourceActions;
};

export const CREATE = 'CREATE';
export const LIST = 'LIST';
export const VIEW = 'VIEW';
export const UPDATE = 'UPDATE';
export const DELETE = 'DELETE';

export type UserRole = {
  id?: number;
  name: string;
  description: string;
  resourcePermissions: object;
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
  members: number[];
  admins: number[];
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
  VIEW: 'VIEW',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

const defaultActions: ResourceActions = {
  VIEW: false,
  CREATE: false,
  UPDATE: false,
  DELETE: false,
};

export const defaultResourcePermissions: UserPermissions = {
  MODERATION: defaultActions,
  LEARNERS: defaultActions,
  CLASS_ADMINS: defaultActions,
  INSTITUTION_ADMINS: defaultActions,
  INSTITUTION_MEMBERS: defaultActions,
  INSTITUTIONS: defaultActions,
  ANNOUNCEMENTS: defaultActions,
  COURSES: defaultActions,
  GROUPS: defaultActions,
  REPORTS: defaultActions,
  ROLES: defaultActions,
};
