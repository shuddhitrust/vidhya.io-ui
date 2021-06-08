import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultChatState,
  emptyChatFormRecord,
  ChatFormCloseURL,
  ChatStateModel,
} from './chat.model';

import { Injectable } from '@angular/core';
import {
  CreateUpdateChatAction,
  DeleteChatAction,
  FetchChatsAction,
  ForceRefetchChatsAction,
  GetChatAction,
  ResetChatFormAction,
} from './chat.actions';
import { CHAT_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { Chat, MatSelectOption, PaginationObject } from '../../common/models';
import { CHAT_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  updatePaginationObject,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';

@State<ChatStateModel>({
  name: 'chatState',
  defaults: defaultChatState,
})
@Injectable()
export class ChatState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listChats(state: ChatStateModel): Chat[] {
    return state.chats;
  }

  @Selector()
  static isFetching(state: ChatStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static paginationObject(state: ChatStateModel): PaginationObject {
    return state.paginationObject;
  }
  @Selector()
  static listChatOptions(state: ChatStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.chats.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: `${i.name} (${i.location})`,
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

  @Action(FetchChatsAction)
  fetchChats(
    { getState, patchState }: StateContext<ChatStateModel>,
    { payload }: FetchChatsAction
  ) {
    patchState({ isFetching: true });
    const { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, paginationObject } = state;
    const { searchQuery, newPageSize, newPageNumber } = searchParams;
    const newPaginationObject = updatePaginationObject({
      paginationObject,
      newPageNumber,
      newPageSize,
    });
    console.log('new pagination object after the update method => ', {
      newPaginationObject,
    });
    const variables = {
      searchField: searchQuery,
      limit: newPaginationObject.pageSize,
      offset: newPaginationObject.offset,
    };
    console.log('variables for chats fetch ', { variables });
    this.apollo
      .watchQuery({
        query: CHAT_QUERIES.GET_CHATS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.chats;
        const totalCount = response[0]?.totalCount
          ? response[0]?.totalCount
          : 0;
        newPaginationObject.totalCount = totalCount;
        console.log('from after getting chats', {
          totalCount,
          response,
          newPaginationObject,
        });
        patchState({
          chats: response,
          paginationObject: newPaginationObject,
          isFetching: false,
        });
      });
  }

  @Action(GetChatAction)
  getChat(
    { patchState }: StateContext<ChatStateModel>,
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
        patchState({ chatFormRecord: response, isFetching: false });
      });
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

  @Action(ResetChatFormAction)
  resetChatForm({ patchState }: StateContext<ChatStateModel>) {
    patchState({
      chatFormRecord: emptyChatFormRecord,
      formSubmitting: false,
    });
  }
}
