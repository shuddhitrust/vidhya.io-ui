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
  chatmessageSet: [],
};
export interface ChatStateModel {
  chats: Chat[];
  chatMessagesSubscribed: boolean;
  chatMembers: User[];
  isFetchingChatMembers: boolean;
  isFetchingChatMessages: boolean;
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  chatMessagesPaginationObject: PaginationObject;
  chatFormId: number;
  isCreatingNewChatMessage: boolean;
  chatFormRecord: Chat;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultChatState: ChatStateModel = {
  chats: [],
  chatMessagesSubscribed: false,
  chatMembers: [],
  isFetchingChatMembers: false,
  isFetchingChatMessages: false,
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  chatMessagesPaginationObject: startingPaginationObject,
  chatFormId: null,
  chatFormRecord: emptyChatFormRecord,
  isCreatingNewChatMessage: false,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ChatFormCloseURL = uiroutes.CHAT_ROUTE;
