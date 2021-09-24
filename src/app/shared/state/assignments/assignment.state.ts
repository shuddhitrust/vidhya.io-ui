import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultAssignmentState,
  AssignmentStateModel,
  Assignment,
} from './assignment.model';

import { Injectable } from '@angular/core';
import {
  FetchAssignmentsAction,
  FetchNextAssignmentsAction,
  ForceRefetchAssignmentsAction,
} from './assignment.actions';
import { ASSIGNMENT_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  updateFetchParams,
  convertPaginatedListToNormalList,
} from '../../common/functions';
import { Router } from '@angular/router';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { Location } from '@angular/common';
import { FetchParams, startingFetchParams } from '../../common/models';
import { ToggleLoadingScreen } from '../loading/loading.actions';

@State<AssignmentStateModel>({
  name: 'assignmentState',
  defaults: defaultAssignmentState,
})
@Injectable()
export class AssignmentState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router,
    private location: Location
  ) {}

  @Selector()
  static listAssignments(state: AssignmentStateModel): Assignment[] {
    return state.assignments;
  }

  @Selector()
  static isFetching(state: AssignmentStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: AssignmentStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }

  @Selector()
  static errorFetching(state: AssignmentStateModel): boolean {
    return state.errorFetching;
  }

  @Action(ForceRefetchAssignmentsAction)
  forceRefetchExercises({
    getState,
    patchState,
  }: StateContext<AssignmentStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    const state = getState();

    let previousFetchParams =
      state.fetchParamObjects[state.fetchParamObjects.length - 1];
    previousFetchParams = previousFetchParams
      ? previousFetchParams
      : startingFetchParams;
    const pageNumber = previousFetchParams?.currentPage
      ? previousFetchParams?.currentPage
      : 1;
    const previousSearchParams: SearchParams = {
      pageNumber,
      pageSize: previousFetchParams.pageSize,
      searchQuery: previousFetchParams.searchQuery,
      columnFilters: previousFetchParams.columnFilters,
    };
    this.store.dispatch(
      new FetchAssignmentsAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchNextAssignmentsAction)
  fetchNextAssignments({ getState }: StateContext<AssignmentStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPage;
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
        new FetchAssignmentsAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchAssignmentsAction)
  fetchAssignments(
    { getState, patchState }: StateContext<AssignmentStateModel>,
    { payload }: FetchAssignmentsAction
  ) {
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    const variables = {
      status: columnFilters.status,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    patchState({ isFetching: true });
    this.store.dispatch(
      new ToggleLoadingScreen({
        message: 'Fetching assignments...',
        showLoadingScreen: true,
      })
    );
    this.apollo
      .watchQuery({
        query: ASSIGNMENT_QUERIES.GET_ASSIGNMENTS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
            })
          );
          const response = data.assignments;

          newFetchParams = { ...newFetchParams };
          let paginatedAssignments = state.paginatedAssignments;
          paginatedAssignments = {
            ...paginatedAssignments,
            [pageNumber]: response,
          };

          let assignments =
            convertPaginatedListToNormalList(paginatedAssignments);
          let lastPage = null;
          if (response.length < newFetchParams.pageSize) {
            lastPage = newFetchParams.currentPage;
          }
          patchState({
            assignments,
            paginatedAssignments,
            lastPage,
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
}
