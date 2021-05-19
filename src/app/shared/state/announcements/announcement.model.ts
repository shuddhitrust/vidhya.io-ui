import {
  Announcement,
  FetchPolicy,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';

export const emptyAnnouncementFormRecord: Announcement = {
  __typename: 'Announcement',
  id: null,
  title: null,
  // author: null,
  message: null,
  // recipients: null,
  // groups: null,
  createdAt: null,
  updatedAt: null,
};

export interface AnnouncementStateModel {
  announcements: Announcement[];
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  announcementFormId: string;
  announcementFormRecord: Announcement;
  isFetching: boolean;
  isFetchingFormRecord: boolean;
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
  isFetchingFormRecord: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};
