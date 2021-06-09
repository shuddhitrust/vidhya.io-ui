import {
  FetchPolicy,
  Chat,
  PaginationObject,
  startingPaginationObject,
  User,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

export const emptyChatFormRecord: Chat = {
  id: null,
  name: null,
  admins: [],
  members: [],
};
export interface ChatStateModel {
  chats: Chat[];
  chatMembers: User[];
  isFetchingChatMembers: boolean;
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
  chatMembers: [],
  isFetchingChatMembers: false,
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  chatFormId: null,
  chatFormRecord: emptyChatFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ChatFormCloseURL = uiroutes.CHAT_ROUTE;
