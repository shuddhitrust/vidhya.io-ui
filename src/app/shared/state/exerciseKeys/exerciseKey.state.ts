import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultExerciseKeyState,
  emptyExerciseKeyFormRecord,
  ExerciseKeyFormCloseURL,
  ExerciseKeyStateModel,
} from './exerciseKey.model';

import { Injectable } from '@angular/core';
import {
  ExerciseKeySubscriptionAction,
  CreateUpdateExerciseKeyAction,
  DeleteExerciseKeyAction,
  FetchExerciseKeysAction,
  FetchNextExerciseKeysAction,
  ForceRefetchExerciseKeysAction,
  GetExerciseKeyAction,
  ResetExerciseKeyFormAction,
  ResetExerciseKeyStateAction,
} from './exerciseKey.actions';
import { EXERCISE_KEY_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { ExerciseKey, MatSelectOption, FetchParams } from '../../common/models';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  fetchParamsNewOrNot,
  subscriptionUpdater,
  updateFetchParams,
  convertPaginatedListToNormalList,
  paginatedSubscriptionUpdater,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';
import { SUBSCRIPTIONS } from '../../api/graphql/subscriptions.graphql';
import { SearchParams } from '../../abstract/master-grid/table.model';

@State<ExerciseKeyStateModel>({
  name: 'exerciseKeyState',
  defaults: defaultExerciseKeyState,
})
@Injectable()
export class ExerciseKeyState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listExerciseKeys(state: ExerciseKeyStateModel): ExerciseKey[] {
    return state.exerciseKeys;
  }

  @Selector()
  static isFetching(state: ExerciseKeyStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: ExerciseKeyStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listExerciseKeyOptions(
    state: ExerciseKeyStateModel
  ): MatSelectOption[] {
    const options: MatSelectOption[] = state.exerciseKeys.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.exercise?.prompt,
      };
      return option;
    });
    console.log('options', options);
    return options;
  }

  @Selector()
  static errorFetching(state: ExerciseKeyStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: ExerciseKeyStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: ExerciseKeyStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getExerciseKeyFormRecord(state: ExerciseKeyStateModel): ExerciseKey {
    return state.exerciseKeyFormRecord;
  }

  @Action(ForceRefetchExerciseKeysAction)
  forceRefetchExerciseKeys({
    patchState,
  }: StateContext<ExerciseKeyStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchExerciseKeysAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchNextExerciseKeysAction)
  fetchNextExerciseKeys({ getState }: StateContext<ExerciseKeyStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPage;
    const previousFetchParams =
      state.fetchParamObjects[state.fetchParamObjects.length - 1];
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
        new FetchExerciseKeysAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchExerciseKeysAction)
  fetchExerciseKeys(
    { getState, patchState }: StateContext<ExerciseKeyStateModel>,
    { payload }: FetchExerciseKeysAction
  ) {
    console.log('Fetching exerciseKeys from exerciseKey state');
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects, exerciseKeysSubscribed } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    const variables = {
      searchField: searchQuery,
      exerciseId: columnFilters.exerciseId,
      chapterId: columnFilters.chapterId,
      courseId: columnFilters.courseId,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    if (fetchParamsNewOrNot({ fetchParamObjects, newFetchParams })) {
      patchState({ isFetching: true });
      console.log('variables for exerciseKeys fetch ', { variables });
      this.apollo
        .watchQuery({
          query: EXERCISE_KEY_QUERIES.GET_EXERCISE_KEYS,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(
          ({ data }: any) => {
            console.log('resposne to get exerciseKeys query ', { data });
            const response = data.exerciseKeys;
            const totalCount = response[0]?.totalCount
              ? response[0]?.totalCount
              : 0;
            newFetchParams = { ...newFetchParams, totalCount };
            console.log('from after getting exerciseKeys', {
              totalCount,
              response,
              newFetchParams,
            });
            let paginatedExerciseKeys = state.paginatedExerciseKeys;
            paginatedExerciseKeys = {
              ...paginatedExerciseKeys,
              [pageNumber]: response,
            };
            console.log({ paginatedExerciseKeys });
            let exerciseKeys = convertPaginatedListToNormalList(
              paginatedExerciseKeys
            );
            let lastPage = null;
            if (response.length < newFetchParams.pageSize) {
              lastPage = newFetchParams.currentPage;
            }
            patchState({
              lastPage,
              exerciseKeys,
              paginatedExerciseKeys,
              fetchParamObjects: state.fetchParamObjects.concat([
                newFetchParams,
              ]),
              isFetching: false,
            });
            if (!exerciseKeysSubscribed) {
              this.store.dispatch(new ExerciseKeySubscriptionAction());
            }
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

  @Action(ExerciseKeySubscriptionAction)
  subscribeToExerciseKeys({
    getState,
    patchState,
  }: StateContext<ExerciseKeyStateModel>) {
    const state = getState();
    if (!state.exerciseKeysSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.exerciseKey,
        })
        .subscribe((result: any) => {
          const state = getState();
          console.log('exerciseKey subscription result ', {
            exerciseKeys: state.exerciseKeys,
            result,
          });
          const method = result?.data?.notifyExerciseKey?.method;
          const exerciseKey = result?.data?.notifyExerciseKey?.exerciseKey;
          const { newPaginatedItems, newItemsList } =
            paginatedSubscriptionUpdater({
              paginatedItems: state.paginatedExerciseKeys,
              method,
              modifiedItem: exerciseKey,
            });
          patchState({
            exerciseKeys: newItemsList,
            paginatedExerciseKeys: newPaginatedItems,
            exerciseKeysSubscribed: true,
          });
        });
    }
  }

  @Action(GetExerciseKeyAction)
  getExerciseKey(
    { patchState }: StateContext<ExerciseKeyStateModel>,
    { payload }: GetExerciseKeyAction
  ) {
    const { exerciseId } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: EXERCISE_KEY_QUERIES.GET_EXERCISE_KEY,
        variables: { exerciseId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.exerciseKey;
          patchState({ exerciseKeyFormRecord: response, isFetching: false });
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

  @Action(ResetExerciseKeyFormAction)
  resetExerciseKeyForm({ patchState }: StateContext<ExerciseKeyStateModel>) {
    patchState({
      exerciseKeyFormRecord: emptyExerciseKeyFormRecord,
      formSubmitting: false,
    });
  }

  @Action(ResetExerciseKeyStateAction)
  resetExerciseKeyState({ patchState }: StateContext<ExerciseKeyStateModel>) {
    patchState(defaultExerciseKeyState);
  }
}
