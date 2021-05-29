import {
  FetchPolicy,
  Announcement,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';

export const emptyAnnouncementFormRecord: Announcement = {
  __typename: 'Announcement',
  id: null,
  title: null,
  author: { id: null },
  message: null,
  institution: { id: null },
  groups: [],
};
export interface AnnouncementStateModel {
  announcements: Announcement[];
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  announcementFormId: number;
  announcementFormRecord: Announcement;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultAnnouncementState: AnnouncementStateModel = {
  announcements: [],
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  announcementFormId: null,
  announcementFormRecord: emptyAnnouncementFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const AnnouncementFormCloseURL =
  'dashboard?adminSection=Institutions&tab=Announcements';
