import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultExerciseState,
  emptyExerciseFormRecord,
  ExerciseFormCloseURL,
  ExerciseStateModel,
} from './exercise.model';

import { Injectable } from '@angular/core';
import {
  ExerciseSubscriptionAction,
  CreateUpdateExerciseAction,
  DeleteExerciseAction,
  FetchExercisesAction,
  FetchNextExercisesAction,
  ForceRefetchExercisesAction,
  GetExerciseAction,
  ResetExerciseFormAction,
} from './exercise.actions';
import { EXERCISE_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Exercise,
  MatSelectOption,
  FetchParams,
} from '../../common/models';
import { EXERCISE_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  fetchParamsNewOrNot,
  subscriptionUpdater,
  updateFetchParams,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';
import { SUBSCRIPTIONS } from '../../api/graphql/subscriptions.graphql';
import { SearchParams } from '../../abstract/master-grid/table.model';

@State<ExerciseStateModel>({
  name: 'exerciseState',
  defaults: defaultExerciseState,
})
@Injectable()
export class ExerciseState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listExercises(state: ExerciseStateModel): Exercise[] {
    return state.exercises;
  }

  @Selector()
  static isFetching(state: ExerciseStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: ExerciseStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listExerciseOptions(
    state: ExerciseStateModel
  ): MatSelectOption[] {
    const options: MatSelectOption[] = state.exercises.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.prompt,
      };
      return option;
    });
    console.log('options', options);
    return options;
  }

  @Selector()
  static errorFetching(state: ExerciseStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: ExerciseStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: ExerciseStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getExerciseFormRecord(
    state: ExerciseStateModel
  ): Exercise {
    return state.exerciseFormRecord;
  }

  @Action(ForceRefetchExercisesAction)
  forceRefetchExercises({
    patchState,
  }: StateContext<ExerciseStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchExercisesAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchNextExercisesAction)
  fetchNextExercises({ getState }: StateContext<ExerciseStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPage;
    const newPageNumber =
      state.fetchParamObjects[state.fetchParamObjects.length - 1].currentPage +
      1;
    const newSearchParams: SearchParams = {
      ...defaultSearchParams,
      newPageNumber,
    };
    if (
      !lastPageNumber ||
      (lastPageNumber != null && newPageNumber <= lastPageNumber)
    ) {
      this.store.dispatch(
        new FetchExercisesAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchExercisesAction)
  fetchExercises(
    { getState, patchState }: StateContext<ExerciseStateModel>,
    { payload }: FetchExercisesAction
  ) {
    console.log('Fetching exercises from exercise state');
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects, exercisesSubscribed } = state;
    const { newSearchQuery, newPageSize, newPageNumber, newColumnFilters } =
      searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber,
      newPageSize,
      newSearchQuery,
      newColumnFilters,
    });
    // // Resetting list of exercises if chapterId filter is different
    // if(fetchParamObjects.length > 0) {
    //   const lastKnownFetchParamObjects = fetchParamObjects[fetchParamObjects.length-1];
    //   console.log('lastKnownFetchParams', {lastKnownFetchParamObjects, fetchParamObjects})
    //   const lastUsedChapterId = lastKnownFetchParamObjects['columnFilters']['chapterId'];
    //   console.log('lastUsedChapterId => ',{lastUsedChapterId});
    //   if(lastUsedChapterId != newColumnFilters.chapterId) {
    //     console.log('resetting the exercises because this is different')
    //     patchState({exercises: []});
    //   }

    // }
    const variables = {
      chapterId: newColumnFilters.chapterId,
      searchField: newSearchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    if (fetchParamsNewOrNot({ fetchParamObjects, newFetchParams })) {
      patchState({ isFetching: true });
      console.log('variables for exercises fetch ', { variables });
      this.apollo
        .watchQuery({
          query: EXERCISE_QUERIES.GET_EXERCISES,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(
          ({ data }: any) => {
            console.log('resposne to get exercises query ', { data });
            const response = data.exercises;
            const totalCount = response[0]?.totalCount
              ? response[0]?.totalCount
              : 0;
            newFetchParams = { ...newFetchParams, totalCount };
            console.log('from after getting exercises', {
              totalCount,
              response,
              newFetchParams,
            });
            let exercises = state.exercises;
            exercises = exercises.concat(response);
            let lastPage = null;
            if (response.length < newFetchParams.pageSize) {
              lastPage = newFetchParams.currentPage;
            }
            patchState({
              lastPage,
              exercises,
              fetchParamObjects: state.fetchParamObjects.concat([
                newFetchParams,
              ]),
              isFetching: false,
            });
            if (!exercisesSubscribed) {
              this.store.dispatch(new ExerciseSubscriptionAction());
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

  @Action(ExerciseSubscriptionAction)
  subscribeToExercises({
    getState,
    patchState,
  }: StateContext<ExerciseStateModel>) {
    const state = getState();
    if (!state.exercisesSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.exercise,
        })
        .subscribe((result: any) => {
          const state = getState();
          console.log('exercise subscription result ', {
            exercises: state.exercises,
            result,
          });
          const method = result?.data?.notifyExercise?.method;
          const exercise = result?.data?.notifyExercise?.exercise;
          const { items, fetchParamObjects } = subscriptionUpdater({
            items: state.exercises,
            method,
            subscriptionItem: exercise,
            fetchParamObjects: state.fetchParamObjects,
          });
          patchState({
            exercises: items,
            fetchParamObjects,
            exercisesSubscribed: true,
          });
        });
    }
  }

  @Action(GetExerciseAction)
  getExercise(
    { patchState }: StateContext<ExerciseStateModel>,
    { payload }: GetExerciseAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: EXERCISE_QUERIES.GET_EXERCISE,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.exercise;
          patchState({ exerciseFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateExerciseAction)
  createUpdateExercise(
    { getState, patchState }: StateContext<ExerciseStateModel>,
    { payload }: CreateUpdateExerciseAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      let errorFetching = false;
      patchState({ formSubmitting, errorFetching});
      const values = form.value;
      console.log('Exercise Form values', values);
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
            ? EXERCISE_MUTATIONS.UPDATE_EXERCISE
            : EXERCISE_MUTATIONS.CREATE_EXERCISE,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm
              ? data.updateExercise
              : data.createExercise;
            patchState({ formSubmitting: false });
            console.log('update exercise ', { response });
            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Exercise ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              // this.router.navigateByUrl(ExerciseFormCloseURL);
              patchState({
                errorSubmitting: false,
                exerciseFormRecord: emptyExerciseFormRecord,
                fetchPolicy: 'network-only',
              });
            } else {
              patchState({
                errorSubmitting: true
              })
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
            console.log('From createUpdateExercise', { response });
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

  @Action(DeleteExerciseAction)
  deleteExercise(
    {}: StateContext<ExerciseStateModel>,
    { payload }: DeleteExerciseAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: EXERCISE_MUTATIONS.DELETE_EXERCISE,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteExercise;
          console.log('from delete exercise ', { data });
          if (response.ok) {
            this.router.navigateByUrl(ExerciseFormCloseURL);
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Exercise deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchExercisesAction({
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

  @Action(ResetExerciseFormAction)
  resetExerciseForm({ patchState }: StateContext<ExerciseStateModel>) {
    patchState(defaultExerciseState);
  }
}
