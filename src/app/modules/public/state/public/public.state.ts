import { Action, Selector, State, StateContext, Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { PUBLIC_QUERIES } from '../../../../shared/api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';

import {
  convertPaginatedListToNormalList,
  getErrorMessageFromGraphQLResponse,
  updateFetchParams,
} from 'src/app/shared/common/functions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import {
  Institution,
  startingFetchParams,
  User,
} from 'src/app/shared/common/models';
import { defaultPublicState, PublicStateModel } from './public.model';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import {
  FetchNextPublicInstitutionsAction,
  FetchNextPublicMembersAction,
  FetchPublicInstitutionssAction,
  FetchPublicMembersAction,
  GetMemberByUsernameAction,
  GetPublicInstitutionAction,
  ResetPublicHomePageListsAction,
  ResetPublicInstitutionFormAction,
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
  static getInstitutionFormRecord(state: PublicStateModel): Institution {
    return state.institutionFormRecord;
  }

  @Selector()
  static listInstitutions(state: PublicStateModel): Institution[] {
    return state.institutions;
  }

  @Selector()
  static listMembers(state: PublicStateModel): User[] {
    return state.members;
  }

  @Selector()
  static isFetchingMembers(state: PublicStateModel): boolean {
    return state.isFetchingMembers;
  }

  @Selector()
  static isFetchingInstitutions(state: PublicStateModel): boolean {
    return state.isFetchingInstitutions;
  }

  @Selector()
  static isFetchingFormRecord(state: PublicStateModel): boolean {
    return state.isFetchingFormRecord;
  }

  @Action(FetchNextPublicMembersAction)
  fetchNextPublicMembers({ getState }: StateContext<PublicStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPagePublicMembers;
    let previousFetchParams =
      state.fetchMembersParamObjects[state.fetchMembersParamObjects.length - 1];
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
    const { fetchPolicy, fetchMembersParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects: fetchMembersParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    patchState({ isFetchingMembers: true });
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
        query: PUBLIC_QUERIES.GET_PUBLIC_USERS,
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
            fetchMembersParamObjects: state.fetchMembersParamObjects.concat([
              newFetchParams,
            ]),
            isFetchingMembers: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingMembers: false });
        }
      );
  }

  @Action(GetMemberByUsernameAction)
  getMemberByUsername(
    { patchState }: StateContext<PublicStateModel>,
    { payload }: GetMemberByUsernameAction
  ) {
    const { username } = payload;
    patchState({ isFetchingFormRecord: true });
    this.apollo
      .watchQuery({
        query: PUBLIC_QUERIES.GET_USER_BY_USERNAME,
        variables: { username },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.userByUsername;
          patchState({
            memberFormRecord: response,
            isFetchingFormRecord: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingFormRecord: false });
        }
      );
  }

  @Action(ResetPublicMemberFormAction)
  resetPublicMemberFormAction({ patchState }: StateContext<PublicStateModel>) {
    patchState({
      isFetchingFormRecord: false,
      memberFormRecord: defaultPublicState.memberFormRecord,
    });
  }

  @Action(FetchNextPublicInstitutionsAction)
  fetchNextPublicInstitutions({ getState }: StateContext<PublicStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPagePublicInstitutions;
    let previousFetchParams =
      state.fetchInstitutionsParamObjects[
        state.fetchInstitutionsParamObjects.length - 1
      ];
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
        new FetchPublicInstitutionssAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchPublicInstitutionssAction)
  fetchPublicInstitutions(
    { getState, patchState }: StateContext<PublicStateModel>,
    { payload }: FetchPublicInstitutionssAction
  ) {
    const state = getState();
    const { searchParams } = payload;
    const { fetchPolicy, fetchInstitutionsParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects: fetchInstitutionsParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    patchState({ isFetchingInstitutions: true });
    const variables = {
      searchField: searchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };

    this.apollo
      .watchQuery({
        query: PUBLIC_QUERIES.GET_PUBLIC_INSTITUTIONS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.publicInstitutions.records;

          newFetchParams = { ...newFetchParams };
          let paginatedPublicInstitutions = state.paginatedPublicInstitutions;
          paginatedPublicInstitutions = {
            ...paginatedPublicInstitutions,
            [pageNumber]: response,
          };
          let institutions = convertPaginatedListToNormalList(
            paginatedPublicInstitutions
          );
          let lastPagePublicInstitutions = null;
          if (response.length < newFetchParams.pageSize) {
            lastPagePublicInstitutions = newFetchParams.currentPage;
          }
          patchState({
            institutions,
            paginatedPublicInstitutions,
            lastPagePublicInstitutions,
            fetchInstitutionsParamObjects:
              state.fetchInstitutionsParamObjects.concat([newFetchParams]),
            isFetchingInstitutions: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingInstitutions: false });
        }
      );
  }

  @Action(GetPublicInstitutionAction)
  getPublicInstitution(
    { patchState }: StateContext<PublicStateModel>,
    { payload }: GetPublicInstitutionAction
  ) {
    const { code } = payload;
    patchState({ isFetchingFormRecord: true });
    this.apollo
      .watchQuery({
        query: PUBLIC_QUERIES.GET_PUBLIC_INSTITUTION,
        variables: { code },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.publicInstitution;
          patchState({
            institutionFormRecord: response,
            isFetchingFormRecord: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingFormRecord: false });
        }
      );
  }

  @Action(ResetPublicInstitutionFormAction)
  resetPublicInstitutionFormAction({
    patchState,
  }: StateContext<PublicStateModel>) {
    patchState({
      isFetchingFormRecord: false,
      institutionFormRecord: defaultPublicState.institutionFormRecord,
    });
  }

  @Action(ResetPublicHomePageListsAction)
  resetPublicHomePageListsAction({
    patchState,
  }: StateContext<PublicStateModel>) {
    patchState({
      isFetchingMembers: false,
      memberFormRecord: defaultPublicState.memberFormRecord,
      members: defaultPublicState.members,
      isFetchingInstitutions: false,
      institutionFormRecord: defaultPublicState.institutionFormRecord,
      institutions: defaultPublicState.institutions,
    });
  }
}
