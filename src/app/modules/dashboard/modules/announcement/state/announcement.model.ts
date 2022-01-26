import {
  FetchPolicyModel,
  Announcement,
  FetchParams,
} from '../../../../../shared/common/models';

export const emptyAnnouncementFormRecord: Announcement = {
  id: null,
  title: null,
  author: null,
  public: false,
  image: null,
  blurb: null,
  message: null,
  institution: null,
  recipientsGlobal: false,
  recipientsInstitution: false,
  groups: [],
};
export interface AnnouncementStateModel {
  announcements: Announcement[];
  paginatedAnnouncements: any;
  lastPage: number;
  announcementsSubscribed: boolean;
  fetchPolicy: FetchPolicyModel;
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
