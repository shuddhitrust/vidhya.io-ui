import { CHATS } from 'src/app/pages/static/dashboard/tabs/admin-dashboard/admin-dashboard.component';
import { defaultLogos } from '../../common/constants';
import {
  FetchPolicy,
  Chat,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

export const emptyChatFormRecord: Chat = {
  id: null,
  name: null,
  location: null,
  city: null,
  website: null,
  phone: null,
  logo: defaultLogos.chat,
  bio: null,
  invitecode: null,
};
export interface ChatStateModel {
  chats: Chat[];
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  chatFormId: number;
  chatFormRecord: Chat;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultChatState: ChatStateModel = {
  chats: [],
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  chatFormId: null,
  chatFormRecord: emptyChatFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ChatFormCloseURL =
  uiroutes.DASHBOARD_ROUTE + '?adminSection=' + CHATS;
