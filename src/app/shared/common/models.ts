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

export type PaginationObject = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  offset: number; // the number of records in all pages prior to current page combined
};

export const startingPaginationObject: PaginationObject = {
  currentPage: 1,
  totalCount: defaultPageSize,
  pageSize: defaultPageSize,
  offset: 0,
};

export type User = any;

export type Announcement = any;

export type CreateGroupMemberInput = any;

export type Group = any;

export const GroupType = {};

export type Institution = {
  __typename: string;
  id: number;
  name: string;
  location: string;
  city: string;
  website: string;
  phone: string;
  logo: string;
  bio: string;
  invitecode: string;
};

export type MembershipStatus = any;
