import {
  FetchPolicy,
  Announcement,
  FetchParams,
  startingFetchParams,
} from '../../common/models';

export const emptyAnnouncementFormRecord: Announcement = {
  id: null,
  title: null,
  author: null,
  message: null,
  institution: null,
  groups: [],
};
export interface AnnouncementStateModel {
  announcements: Announcement[];
  paginatedAnnouncements: any;
  lastPage: number;
  announcementsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  announcementFormId: number;
  announcementFormRecord: Announcement;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultAnnouncementState: AnnouncementStateModel = {
  announcements: [],
  paginatedAnnouncements: {},
  lastPage: null,
  announcementsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  announcementFormId: null,
  announcementFormRecord: emptyAnnouncementFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const AnnouncementFormCloseURL =
  'dashboard?adminSection=Institutions&tab=Announcements';
