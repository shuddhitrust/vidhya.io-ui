import {
  Action,
  Select,
  Selector,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import {
  defaultChatState,
  emptyChatFormRecord,
  ChatFormCloseURL,
  ChatStateModel,
} from './chat.model';

import { Injectable } from '@angular/core';
import {
  ChatMessageSubscriptionAction,
  ClearChatMembers,
  CreateChatMessageAction,
  CreateUpdateChatAction,
  DeleteChatAction,
  FetchChatMessagesAction,
  FetchChatsAction,
  ForceRefetchChatsAction,
  GetChatAction,
  GetIntoChatAction,
  ResetChatFormAction,
  SearchChatMembersAction,
  SelectChatAction,
} from './chat.actions';
import { CHAT_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Chat,
  ChatMessage,
  MatSelectOption,
  PaginationObject,
  User,
} from '../../common/models';
import {
  CHAT_MUTATIONS,
  CHAT_MESSAGE_MUTATIONS,
} from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  paginationChanged,
  subscriptionUpdater,
  updatePaginationObject,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';
import { AuthState } from '../auth/auth.state';
import { Observable } from 'rxjs';
import { SUBSCRIPTIONS } from '../../api/graphql/subscriptions.graphql';
import { state } from '@angular/animations';

@State<ChatStateModel>({
  name: 'chatState',
  defaults: defaultChatState,
})
@Injectable()
export class ChatState {
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<User>;
  currentMember: User;

  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
  }

  @Selector()
  static listChats(state: ChatStateModel): Chat[] {
    return state.chats;
  }

  @Selector()
  static listChatMembers(state: ChatStateModel): User[] {
    return state.chatMembers;
  }

  @Selector()
  static getIsFetchingChatMembers(state: ChatStateModel): boolean {
    return state.isFetchingChatMembers;
  }

  @Selector()
  static isFetching(state: ChatStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static isCreatingNewChatMessage(state: ChatStateModel): boolean {
    return state.isCreatingNewChatMessage;
  }

  isCreatingNewChatMessage;

  @Selector()
  static paginationObject(state: ChatStateModel): PaginationObject {
    return state.paginationObject;
  }
  @Selector()
  static listChatOptions(state: ChatStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.chats.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: `${i.name}`,
      };
      return option;
    });
    console.log('chat dropdown ptions', options);
    return options;
  }

  @Selector()
  static errorFetching(state: ChatStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: ChatStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: ChatStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getChatFormRecord(state: ChatStateModel): Chat {
    return state.chatFormRecord;
  }

  @Action(ForceRefetchChatsAction)
  forceRefetchChats({ patchState }: StateContext<ChatStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchChatsAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(SearchChatMembersAction)
  searchChatMembers(
    { getState, patchState }: StateContext<ChatStateModel>,
    { payload }: SearchChatMembersAction
  ) {
    const { query } = payload;
    const state = getState();
    const { fetchPolicy } = state;
    patchState({ isFetchingChatMembers: true });
    this.apollo
      .watchQuery({
        query: CHAT_QUERIES.GET_CHAT_MEMBERS,
        variables: { query },
        fetchPolicy,
      })
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.chatMembers;

        patchState({
          chatMembers: response,
          isFetchingChatMembers: false,
        });
      });
  }

  @Action(FetchChatsAction)
  fetchChats(
    { getState, patchState }: StateContext<ChatStateModel>,
    { payload }: FetchChatsAction
  ) {
    const state = getState();
    const { paginationObject } = state;
    const { searchParams } = payload;
    const { newSearchQuery, newPageSize, newPageNumber } = searchParams;
    let newPaginationObject = updatePaginationObject({
      paginationObject,
      newPageNumber,
      newPageSize,
      newSearchQuery,
    });
    patchState({ isFetching: true });
    const variables = {
      searchField: newSearchQuery,
      limit: newPaginationObject.pageSize,
      offset: newPaginationObject.offset,
    };
    this.apollo
      .watchQuery({
        query: CHAT_QUERIES.GET_CHATS,
        variables,
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.chats;
        const totalCount = response[0]?.totalCount
          ? response[0]?.totalCount
          : 0;
        newPaginationObject = { ...newPaginationObject, totalCount };

        patchState({
          chats: response,
          paginationObject: newPaginationObject,
          isFetching: false,
        });
        this.store.dispatch(new ChatMessageSubscriptionAction());
      });
  }

  @Action(SelectChatAction)
  selectChat(
    { getState, patchState }: StateContext<ChatStateModel>,
    { payload }: GetChatAction
  ) {
    const { id } = payload;
    console.log('id from select Chat action ', { id });
    if (id) {
      const state = getState();
      const chat = state.chats.find((c) => c.id == id);
      patchState({ chatFormRecord: chat });
      this.store.dispatch(
        new FetchChatMessagesAction({
          chatId: chat.id,
          searchParams: defaultSearchParams,
        })
      );
    } else {
      patchState({ chatFormRecord: emptyChatFormRecord });
    }
  }

  @Action(GetChatAction)
  getChat(
    { getState, patchState }: StateContext<ChatStateModel>,
    { payload }: GetChatAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: CHAT_QUERIES.GET_CHAT,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.chat;
        console.log('Response for getChat => ', { data });
        const state = getState();
        const chats = [response, ...state.chats];
        patchState({ chatFormRecord: response, chats, isFetching: false });
      });
  }

  @Action(GetIntoChatAction)
  getIntoChat(
    { patchState }: StateContext<ChatStateModel>,
    { payload }: GetIntoChatAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .mutate({
        mutation: CHAT_MUTATIONS.CHAT_WITH_MEMBER,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.chatWithMember;
          if (response.ok) {
            const chat = response.chat;
            patchState({
              chatFormRecord: chat,
              isFetching: false,
            });
            this.store.dispatch(
              new FetchChatMessagesAction({
                chatId: chat.id,
                searchParams: defaultSearchParams,
              })
            );
          }
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
        }
      );
  }

  @Action(CreateUpdateChatAction)
  createUpdateChat(
    { getState, patchState }: StateContext<ChatStateModel>,
    { payload }: CreateUpdateChatAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;
      console.log('Chat Form values', values);
      const updateForm = values.id == null ? false : true;
      const { id, ...sanitizedValues } = values;
      const variables = updateForm
        ? {
            input: sanitizedValues,
            id: values.id, // adding id to the mutation variables if it is an update mutation
          }
        : { input: sanitizedValues };

      this.apollo
        .mutate({
          mutation: updateForm
            ? CHAT_MUTATIONS.UPDATE_CHAT
            : CHAT_MUTATIONS.CREATE_CHAT,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm ? data.updateChat : data.createChat;
            patchState({ formSubmitting: false });
            console.log('update chat ', { response });
            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Chat ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(ChatFormCloseURL);
              patchState({
                chatFormRecord: emptyChatFormRecord,
                fetchPolicy: 'network-only',
              });
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
            console.log('From createUpdateChat', { response });
          },
          (error) => {
            console.log('Some error happened ', error);
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(error),
                action: 'error',
              })
            );
            patchState({ formSubmitting: false });
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please make sure there are no errors in the form before attempting to submit!',
          action: 'error',
        })
      );
    }
  }

  @Action(DeleteChatAction)
  deleteChat({}: StateContext<ChatStateModel>, { payload }: DeleteChatAction) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: CHAT_MUTATIONS.DELETE_CHAT,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteChat;
          console.log('from delete chat ', { data });
          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Chat deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchChatsAction({
                searchParams: defaultSearchParams,
              })
            );
          } else {
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(response?.errors),
                action: 'error',
              })
            );
          }
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
        }
      );
  }

  @Action(FetchChatMessagesAction)
  fetchChatMessages(
    { getState, patchState }: StateContext<ChatStateModel>,
    { payload }: FetchChatMessagesAction
  ) {
    const state = getState();
    const { chatMessagesPaginationObject } = state;
    const { searchParams, chatId } = payload;
    const { newSearchQuery, newPageSize, newPageNumber } = searchParams;
    let newPaginationObject = updatePaginationObject({
      paginationObject: chatMessagesPaginationObject,
      newPageNumber,
      newPageSize,
      newSearchQuery,
    });
    if (
      paginationChanged({
        paginationObject: chatMessagesPaginationObject,
        newPaginationObject,
      })
    ) {
      patchState({ isFetchingChatMessages: true });
      const variables = {
        chatId,
        searchField: newSearchQuery,
        limit: newPaginationObject.pageSize,
        offset: newPaginationObject.offset,
      };
      this.apollo
        .watchQuery({
          query: CHAT_QUERIES.GET_CHAT_MESSAGES,
          variables,
          fetchPolicy: 'network-only',
        })
        .valueChanges.subscribe(({ data }: any) => {
          const response = data.chatMessages;
          const totalCount = response[0]?.totalCount
            ? response[0]?.totalCount
            : 0;
          newPaginationObject = { ...newPaginationObject, totalCount };
          let chat: Chat = state.chats.find((c) => c.id == chatId);
          if (chat) {
            console.log('line 460 from chat state => ', { chat });
            const chatMessages = chat.chatmessageSet ? chat.chatmessageSet : [];
            const newChatMessages = response.concat(chatMessages);
            chat = { ...chat, chatmessageSet: newChatMessages };
            let chats = state.chats.filter((c) => c.id != chat.id);
            chats = [chat, ...chats];
            let formRecord =
              state.chatFormRecord.id == chat.id ? chat : state.chatFormRecord;

            patchState({
              chats: chats,
              chatFormRecord: formRecord,
              chatMessagesPaginationObject: newPaginationObject,
            });
          }
        });
    }
  }

  @Action(ChatMessageSubscriptionAction)
  subscribeToChatMessage({
    getState,
    patchState,
  }: StateContext<ChatStateModel>) {
    const state = getState();
    if (!state.chatMessagesSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.chatMessage,
        })
        .subscribe((result: any) => {
          const state = getState();
          console.log('chat subscription result ', {
            chats: state.chats,
            result,
          });
          const method = result?.data?.notifyChatMessage?.method;
          const chatMessage = result?.data?.notifyChatMessage?.chatMessage;
          if (chatMessage) {
            let chat: Chat = state.chats.find(
              (c) => c.id == chatMessage?.chat?.id
            );
            if (chat) {
              const chatMessages = chat.chatmessageSet ? ;
              console.log('Chat, chatmessages => ', { chat, chatMessages });
              const { items, paginationObject } = subscriptionUpdater({
                items: chatMessages,
                method,
                subscriptionItem: chatMessage,
                paginationObject: state.paginationObject,
              });
              chat = { ...chat, chatmessageSet: items };
              let chats = state.chats.filter((c) => c.id != chat.id);
              chats = [chat, ...chats];
              patchState({
                chats: chats,
                chatFormRecord: chat,
                paginationObject,
                chatMessagesSubscribed: true,
              });
            } else {
              this.store.dispatch(
                new GetChatAction({ id: chatMessage?.chat?.id })
              );
            }
          }
        });
    }
  }

  @Action(CreateChatMessageAction)
  createChatMessage(
    { getState, patchState }: StateContext<ChatStateModel>,
    { payload }: CreateChatMessageAction
  ) {
    const { id, message } = payload;
    const state = getState();
    console.log('From createChatMessageAction => ', { payload });
    patchState({ isCreatingNewChatMessage: true });
    this.apollo
      .mutate({
        mutation: CHAT_MESSAGE_MUTATIONS.CREATE_CHAT_MESSAGE,
        variables: {
          chat: id,
          message,
          author: this.currentMember.id,
        },
      })
      .subscribe(({ data }: any) => {
        patchState({ isCreatingNewChatMessage: false });

        const response = data.createChatMessage;
        // if (response.ok) {
        //   const chat = response.chatMessage?.chat;
        //   console.log('SETTIING NEW CHAT TO THE CHATFORMRECORD ', { chat });
        //   patchState({ chatFormRecord: chat });
        // }
        console.log('from creating the chat ', { data });
      });
  }

  @Action(ClearChatMembers)
  clearChatMembers({ patchState }: StateContext<ChatStateModel>) {
    patchState({
      chatMembers: [],
    });
  }

  @Action(ResetChatFormAction)
  resetChatForm({ patchState }: StateContext<ChatStateModel>) {
    patchState({
      chatFormRecord: emptyChatFormRecord,
      formSubmitting: false,
    });
  }
}
