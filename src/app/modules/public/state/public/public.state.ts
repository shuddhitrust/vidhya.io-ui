import { Action, Selector, State, StateContext, Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { USER_QUERIES } from '../../../../shared/api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';

import {
  convertPaginatedListToNormalList,
  getErrorMessageFromGraphQLResponse,
  updateFetchParams,
} from 'src/app/shared/common/functions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { startingFetchParams, User } from 'src/app/shared/common/models';
import { defaultPublicState, PublicStateModel } from './public.model';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import {
  FetchNextPublicMembersAction,
  FetchPublicMembersAction,
  GetMemberByUsernameAction,
  ResetPublicHomePageListsAction,
  ResetPublicMemberFormAction,
} from './public.actions';

@State<PublicStateModel>({
  name: 'publicState',
  defaults: defaultPublicState,
})
@Injectable()
export class PublicState {
  constructor(private apollo: Apollo, private store: Store) {}

  @Selector()
  static getMemberFormRecord(state: PublicStateModel): User {
    return state.memberFormRecord;
  }

  @Selector()
  static listMembers(state: PublicStateModel): User[] {
    return state.members;
  }

  @Selector()
  static isFetching(state: PublicStateModel): boolean {
    return state.isFetching;
  }

  @Action(FetchNextPublicMembersAction)
  fetchNextPublicMembers({ getState }: StateContext<PublicStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPagePublicMembers;
    let previousFetchParams =
      state.fetchParamObjects[state.fetchParamObjects.length - 1];
    previousFetchParams = previousFetchParams
      ? previousFetchParams
      : startingFetchParams;
    const pageNumber = previousFetchParams.currentPage + 1;
    const newSearchParams: SearchParams = {
      pageNumber,
      pageSize: previousFetchParams.pageSize,
      searchQuery: previousFetchParams.searchQuery,
      columnFilters: previousFetchParams.columnFilters,
    };
    if (
      !lastPageNumber ||
      (lastPageNumber != null && pageNumber <= lastPageNumber)
    ) {
      this.store.dispatch(
        new FetchPublicMembersAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchPublicMembersAction)
  fetchPublicMembers(
    { getState, patchState }: StateContext<PublicStateModel>,
    { payload }: FetchPublicMembersAction
  ) {
    const state = getState();
    const { searchParams } = payload;
    const { fetchPolicy, fetchParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    patchState({ isFetching: true });
    const variables = {
      searchField: searchQuery,
      membershipStatusNot: columnFilters.membershipStatusNot,
      membershipStatusIs: columnFilters.membershipStatusIs,
      roles: columnFilters.roles,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };

    this.apollo
      .watchQuery({
        query: USER_QUERIES.GET_PUBLIC_USERS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.publicUsers.records;

          newFetchParams = { ...newFetchParams };
          let paginatedPublicMembers = state.paginatedPublicMembers;
          paginatedPublicMembers = {
            ...paginatedPublicMembers,
            [pageNumber]: response,
          };
          let members = convertPaginatedListToNormalList(
            paginatedPublicMembers
          );
          let lastPagePublicMembers = null;
          if (response.length < newFetchParams.pageSize) {
            lastPagePublicMembers = newFetchParams.currentPage;
          }
          patchState({
            members,
            paginatedPublicMembers,
            lastPagePublicMembers,
            fetchParamObjects: state.fetchParamObjects.concat([newFetchParams]),
            isFetching: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetching: false });
        }
      );
  }

  @Action(GetMemberByUsernameAction)
  getMemberByUsername(
    { patchState }: StateContext<PublicStateModel>,
    { payload }: GetMemberByUsernameAction
  ) {
    const { username } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: USER_QUERIES.GET_USER_BY_USERNAME,
        variables: { username },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.userByUsername;
          patchState({ memberFormRecord: response, isFetching: false });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetching: false });
        }
      );
  }

  @Action(ResetPublicMemberFormAction)
  resetPublicMemberFormAction({ patchState }: StateContext<PublicStateModel>) {
    patchState({
      isFetching: false,
      memberFormRecord: defaultPublicState.memberFormRecord,
    });
  }

  @Action(ResetPublicHomePageListsAction)
  resetPublicHomePageListsAction({
    patchState,
  }: StateContext<PublicStateModel>) {
    patchState({
      isFetching: false,
      memberFormRecord: defaultPublicState.memberFormRecord,
      members: defaultPublicState.members,
    });
  }
}
