import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultExerciseState,
  emptyExerciseFormRecord,
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
  ResetExerciseStateAction,
  ReorderExercisesAction,
} from './exercise.actions';
import { EXERCISE_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Exercise,
  MatSelectOption,
  FetchParams,
  ExerciseSubmission,
  SUBSCRIPTION_METHODS,
} from '../../common/models';
import { EXERCISE_MUTATIONS } from '../../api/graphql/mutations.graphql';
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
import { emptyExerciseSubmissionFormRecord } from '../exerciseSubmissions/exerciseSubmission.model';
import { ChapterDraftComponent } from 'src/app/pages/profiles/chapter-profile/draft/chapter-draft.component';

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
  static listExercises(state: ExerciseStateModel): {
    exercises: Exercise[];
    submissions: ExerciseSubmission[];
  } {
    return { exercises: state.exercises, submissions: state.submissions };
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
  static listExerciseOptions(state: ExerciseStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.exercises.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.prompt,
      };
      return option;
    });

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
  static getExerciseFormRecord(state: ExerciseStateModel): Exercise {
    return state.exerciseFormRecord;
  }

  @Action(ForceRefetchExercisesAction)
  forceRefetchExercises({
    getState,
    patchState,
  }: StateContext<ExerciseStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    const state = getState();
    const previousFetchParams =
      state.fetchParamObjects[state.fetchParamObjects.length - 1];
    const pageNumber = previousFetchParams.currentPage;
    const previousSearchParams: SearchParams = {
      pageNumber,
      pageSize: previousFetchParams.pageSize,
      searchQuery: previousFetchParams.searchQuery,
      columnFilters: previousFetchParams.columnFilters,
    };
    console.log('previousFetchParams from force fetch exercises', {
      previousSearchParams,
    });
    this.store.dispatch(
      new FetchExercisesAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchNextExercisesAction)
  fetchNextExercises({ getState }: StateContext<ExerciseStateModel>) {
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
        new FetchExercisesAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchExercisesAction)
  fetchExercises(
    { getState, patchState }: StateContext<ExerciseStateModel>,
    { payload }: FetchExercisesAction
  ) {
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects, exercisesSubscribed } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    // // Resetting list of exercises if chapterId filter is different
    // if(fetchParamObjects.length > 0) {
    //   const lastKnownFetchParamObjects = fetchParamObjects[fetchParamObjects.length-1];
    //   console.log('lastKnownFetchParams', {lastKnownFetchParamObjects, fetchParamObjects})
    //   const lastUsedChapterId = lastKnownFetchParamObjects['columnFilters']['chapterId'];
    //
    //   if(lastUsedChapterId != newColumnFilters.chapterId) {
    //     console.log('resetting the exercises because this is different')
    //     patchState({exercises: []});
    //   }

    // }
    const variables = {
      chapterId: columnFilters.chapterId,
      searchField: searchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    patchState({ isFetching: true });

    this.apollo
      .watchQuery({
        query: EXERCISE_QUERIES.GET_EXERCISES,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.exercises;
          newFetchParams = { ...newFetchParams };
          let paginatedExercises = state.paginatedExercises;
          paginatedExercises = {
            ...paginatedExercises,
            [pageNumber]: response?.exercises,
          };

          let exercises = convertPaginatedListToNormalList(paginatedExercises);

          let submissions = response.submissions;
          if (submissions.length) {
            submissions = exercises.map((e) => {
              const submission = submissions.find(
                (s) => s.exercise?.id == e.id
              );
              if (submission) {
                return submission;
              } else return emptyExerciseSubmissionFormRecord;
            });
          }
          let lastPage = null;
          if (response.length < newFetchParams.pageSize) {
            lastPage = newFetchParams.currentPage;
          }
          patchState({
            lastPage,
            exercises,
            submissions,
            paginatedExercises,
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
          const method = result?.data?.notifyExercise?.method;
          const exercise = result?.data?.notifyExercise?.exercise;
          const { newPaginatedItems, newItemsList } =
            paginatedSubscriptionUpdater({
              paginatedItems: state.paginatedExercises,
              method,
              modifiedItem: exercise,
            });
          patchState({
            exercises: newItemsList,
            paginatedExercises: newPaginatedItems,
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
      patchState({ formSubmitting, errorFetching });
      const values = form.value;

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

            if (response.ok) {
              const method = updateForm
                ? SUBSCRIPTION_METHODS.UPDATE_METHOD
                : SUBSCRIPTION_METHODS.CREATE_METHOD;
              const exercise = response.exercise;
              const { newPaginatedItems, newItemsList } =
                paginatedSubscriptionUpdater({
                  paginatedItems: state.paginatedExercises,
                  method,
                  modifiedItem: exercise,
                });

              form.reset();
              formDirective.resetForm();

              patchState({
                paginatedExercises: newPaginatedItems,
                exercises: newItemsList,
                errorSubmitting: false,
                exerciseFormRecord: emptyExerciseFormRecord,
                fetchPolicy: 'network-only',
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Exercise ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
            } else {
              patchState({
                errorSubmitting: true,
              });
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
    { getState, patchState }: StateContext<ExerciseStateModel>,
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

          if (response.ok) {
            const method = SUBSCRIPTION_METHODS.DELETE_METHOD;
            const exercise = response.exercise;
            const state = getState();
            const { newPaginatedItems, newItemsList } =
              paginatedSubscriptionUpdater({
                paginatedItems: state.paginatedExercises,
                method,
                modifiedItem: exercise,
              });
            patchState({
              paginatedExercises: newPaginatedItems,
              exercises: newItemsList,
              exerciseFormRecord: emptyExerciseFormRecord,
            });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Exercise deleted successfully!',
                action: 'success',
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

  @Action(ResetExerciseStateAction)
  resetExerciseForm({ patchState }: StateContext<ExerciseStateModel>) {
    patchState(defaultExerciseState);
  }

  @Action(ReorderExercisesAction)
  reorderChapters(
    {}: StateContext<ExerciseStateModel>,
    { payload }: ReorderExercisesAction
  ) {
    const { indexList } = payload;
    this.apollo
      .mutate({
        mutation: EXERCISE_MUTATIONS.REORDER_EXERCISES,
        variables: { indexList },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.reorderExercses;
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
}
