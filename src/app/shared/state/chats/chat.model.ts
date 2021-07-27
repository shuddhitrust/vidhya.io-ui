import {
  FetchPolicy,
  Chat,
  FetchParams,
  startingFetchParams,
  User,
  ChatSearchResult,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

export const emptyChatFormRecord: ChatUIObject = {
  id: null,
  name: null,
  subtitle: null,
  avatar: null,
  chatmessageSet: [],
};

export interface ChatUIObject {
  id: number;
  name: string;
  subtitle: string;
  avatar: string;
  chatmessageSet: any[];
}
export interface ChatStateModel {
  chats: ChatUIObject[];
  chatMessagesSubscribed: boolean;
  chatSearchResults: ChatSearchResult[];
  isFetchingChatMembers: boolean;
  isFetchingChatMessages: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  lastChatPage: number;
  chatMessagesFetchParamss: FetchParams[];
  lastChatMessagesPage: number;
  chatFormId: number;
  isCreatingNewChatMessage: boolean;
  chatFormRecord: ChatUIObject;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultChatState: ChatStateModel = {
  chats: [],
  chatMessagesSubscribed: false,
  chatSearchResults: [],
  isFetchingChatMembers: false,
  isFetchingChatMessages: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  lastChatPage: null,
  chatMessagesFetchParamss: [],
  lastChatMessagesPage: null,
  chatFormId: null,
  chatFormRecord: emptyChatFormRecord,
  isCreatingNewChatMessage: false,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ChatFormCloseURL = uiroutes.CHAT_ROUTE.route;
