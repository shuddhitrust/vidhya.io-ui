import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  AssignmentUrl,
  defaultExerciseSubmissionState,
  emptyExerciseSubmissionFormRecord,
  ExerciseSubmissionStateModel,
  GradingGroup,
  GradingUrl,
} from './exerciseSubmission.model';

import { Injectable, OnDestroy } from '@angular/core';
import {
  ExerciseSubmissionSubscriptionAction,
  CreateUpdateExerciseSubmissionsAction,
  DeleteExerciseSubmissionAction,
  FetchExerciseSubmissionsAction,
  FetchNextExerciseSubmissionsAction,
  ForceRefetchExerciseSubmissionsAction,
  GetExerciseSubmissionAction,
  ResetExerciseSubmissionFormAction,
  FetchNextGradingGroupsAction,
  FetchGradingGroupsAction,
  ShowSubmissionHistory,
  ResetSubmissionHistory,
} from './exerciseSubmission.actions';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { ForceRefetchChaptersAction } from '../chapters/chapter.actions';
import { ForceRefetchExercisesAction } from '../exercises/exercise.actions';
import {
  ExerciseSubmission,
  FetchParams,
  MatSelectOption,
  startingFetchParams,
  SUBSCRIPTION_METHODS,
} from 'src/app/shared/common/models';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { EXERCISE_SUBMISSION_QUERIES } from 'src/app/shared/api/graphql/queries.graphql';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import {
  columnFiltersChanged,
  convertPaginatedListToNormalList,
  getErrorMessageFromGraphQLResponse,
  paginatedSubscriptionUpdater,
  SanitizeSubmissionRubricToServer,
  updateFetchParams,
} from 'src/app/shared/common/functions';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { SUBSCRIPTIONS } from 'src/app/shared/api/graphql/subscriptions.graphql';
import { EXERCISE_SUBMISSION_MUTATIONS } from 'src/app/shared/api/graphql/mutations.graphql';
import { ForceRefetchAssignmentsAction } from '../../../assignment/state/assignment.actions';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@State<ExerciseSubmissionStateModel>({
  name: 'exerciseSubmissionState',
  defaults: defaultExerciseSubmissionState,
})
@Injectable()
export class ExerciseSubmissionState implements OnDestroy{
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listGradingGroups(
    state: ExerciseSubmissionStateModel
  ): GradingGroup[] {
    return state.gradingGroups;
  }

  @Selector()
  static isFetchingGradingGroups(state: ExerciseSubmissionStateModel): boolean {
    return state.isFetchingGradingGroups;
  }

  @Selector()
  static listExerciseSubmissions(
    state: ExerciseSubmissionStateModel
  ): ExerciseSubmission[] {
    return state.exerciseSubmissions;
  }

  @Selector()
  static isFetching(state: ExerciseSubmissionStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static isFetchingSubmissionHistory(
    state: ExerciseSubmissionStateModel
  ): boolean {
    return state.isFetchingSubmissionHistory;
  }

  @Selector()
  static submissionHistory(
    state: ExerciseSubmissionStateModel
  ): ExerciseSubmission[] {
    return state.submissionHistory;
  }

  @Selector()
  static fetchParams(state: ExerciseSubmissionStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listExerciseSubmissionOptions(
    state: ExerciseSubmissionStateModel
  ): MatSelectOption[] {
    const options: MatSelectOption[] = state.exerciseSubmissions.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.participant.firstName,
      };
      return option;
    });

    return options;
  }

  @Selector()
  static errorFetching(state: ExerciseSubmissionStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: ExerciseSubmissionStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: ExerciseSubmissionStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getExerciseSubmissionFormRecord(
    state: ExerciseSubmissionStateModel
  ): ExerciseSubmission {
    return state.exerciseSubmissionFormRecord;
  }

  @Action(ForceRefetchExerciseSubmissionsAction)
  forceRefetchExerciseSubmissions({
    getState,
    patchState,
  }: StateContext<ExerciseSubmissionStateModel>) {
    const state = getState();
    let previousFetchParams =
      state.fetchParamObjects[state.fetchParamObjects.length - 1];
    previousFetchParams = previousFetchParams
      ? previousFetchParams
      : startingFetchParams;
    const pageNumber = previousFetchParams?.currentPage;
    const previousSearchParams: SearchParams = {
      pageNumber,
      pageSize: previousFetchParams?.pageSize,
      searchQuery: previousFetchParams?.searchQuery,
      columnFilters: previousFetchParams?.columnFilters,
    };
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchExerciseSubmissionsAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchNextGradingGroupsAction)
  fetchNextExerciseSubmissionGroups({
    getState,
  }: StateContext<ExerciseSubmissionStateModel>) {
    const state = getState();
    const lastPageNumber = state.gradingGroupLastPage;
    let previousFetchParams =
      state.gradingGroupsfetchParamObjects[
        state.gradingGroupsfetchParamObjects.length - 1
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
        new FetchGradingGroupsAction({
          searchParams: newSearchParams,
        })
      );
    }
  }

  @Action(ShowSubmissionHistory)
  showSubmissionHistory(
    { getState, patchState }: StateContext<ExerciseSubmissionStateModel>,
    { payload }: ShowSubmissionHistory
  ) {
    const { exerciseId, participantId } = payload;

    const variables = {
      exerciseId,
      participantId,
    };
    if (
      exerciseId &&
      participantId // This action is only executed when both exerciseId and participantId are valid
    ) {
      patchState({ isFetchingSubmissionHistory: true, submissionHistory: [] });
      this.apollo
        .query({
          query: EXERCISE_SUBMISSION_QUERIES.GET_SUBMISSION_HISTORY,
          variables,
          fetchPolicy: 'network-only',
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          ({ data }: any) => {
            const response = data.submissionHistory;

            // Sanitizing rubric
            const submissionHistory = response.map((s) => {
              return s.rubric ? { ...s, rubric: JSON.parse(s.rubric) } : s;
            });

            patchState({
              submissionHistory,
              isFetchingSubmissionHistory: false,
            });
          },
          (error) => {
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(error),
                action: 'error',
              })
            );
            patchState({ isFetchingSubmissionHistory: false });
          }
        );
    }
  }

  @Action(ResetSubmissionHistory)
  resetSubmissionHistory({
    patchState,
  }: StateContext<ExerciseSubmissionStateModel>) {
    patchState({
      submissionHistory: defaultExerciseSubmissionState.submissionHistory,
      isFetchingSubmissionHistory: false,
    });
  }
  @Action(FetchGradingGroupsAction)
  fetchExerciseSubmissionGroups(
    { getState, patchState }: StateContext<ExerciseSubmissionStateModel>,
    { payload }: FetchGradingGroupsAction
  ) {
    let { searchParams } = payload;
    let state = getState();
    let { fetchPolicy, gradingGroupsfetchParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects: gradingGroupsfetchParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    // Resetting the data if the columnFilters have changed
    if (
      columnFiltersChanged({
        fetchParamObjects: gradingGroupsfetchParamObjects,
        newFetchParams,
      })
    ) {
      patchState({
        gradingGroupLastPage:
          defaultExerciseSubmissionState.gradingGroupLastPage,
        gradingGroups: defaultExerciseSubmissionState.gradingGroups,
        paginatedGradingGroups:
          defaultExerciseSubmissionState.paginatedGradingGroups,
      });
    }
    const variables = {
      groupBy: columnFilters?.groupBy,
      status: columnFilters?.status,
      flagged: columnFilters?.flagged,
      searchField: columnFilters?.searchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    if (
      columnFilters?.groupBy // This action is only executed when groupBy is valid
    ) {
      patchState({
        isFetching: true,
        gradingGroupsfetchParamObjects:
          state.gradingGroupsfetchParamObjects.concat([newFetchParams]),
      });
      this.store.dispatch(
        new ToggleLoadingScreen({
          message: 'Fetching submissions...',
          showLoadingScreen: true,
        })
      );
      this.apollo
        .query({
          query: EXERCISE_SUBMISSION_QUERIES.GET_EXERCISE_SUBMISSION_GROUPS,
          variables,
          fetchPolicy: 'network-only',
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          ({ data }: any) => {
            this.store.dispatch(
              new ToggleLoadingScreen({
                showLoadingScreen: false,
              })
            );
            const response = data.exerciseSubmissionGroups;

            let paginatedGradingGroups = state.paginatedGradingGroups;
            paginatedGradingGroups = {
              ...paginatedGradingGroups,
              [pageNumber]: response,
            };

            let gradingGroups = convertPaginatedListToNormalList(
              paginatedGradingGroups
            );
            let gradingGroupLastPage = null;
            if (response.length < newFetchParams.pageSize) {
              gradingGroupLastPage = newFetchParams.currentPage;
            }
            patchState({
              gradingGroupLastPage,
              gradingGroups,
              paginatedGradingGroups,
              isFetching: false,
            });
            // if (!exerciseSubmissionsSubscribed) {
            //   this.store.dispatch(new ExerciseSubmissionSubscriptionAction());
            // }
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

  @Action(FetchNextExerciseSubmissionsAction)
  fetchNextExerciseSubmissions({
    getState,
  }: StateContext<ExerciseSubmissionStateModel>) {
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
        new FetchExerciseSubmissionsAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchExerciseSubmissionsAction)
  fetchExerciseSubmissions(
    { getState, patchState }: StateContext<ExerciseSubmissionStateModel>,
    { payload }: FetchExerciseSubmissionsAction
  ) {
    let { searchParams } = payload;
    const state = getState();
    let { fetchPolicy, fetchParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    const variables = {
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
      exerciseId: columnFilters?.exerciseId,
      chapterId: columnFilters?.chapterId,
      courseId: columnFilters?.courseId,
      participantId: columnFilters?.participantId,
      submissionId: columnFilters?.submissionId,
      status: columnFilters?.status,
      flagged: columnFilters?.flagged,
      searchField: columnFilters?.searchQuery,
    };
    // Resetting the data if the columnFitlers changed

    if (
      columnFiltersChanged({
        fetchParamObjects,
        newFetchParams,
      })
    ) {
      patchState({
        lastPage: defaultExerciseSubmissionState.lastPage,
        exerciseSubmissions: defaultExerciseSubmissionState.exerciseSubmissions,
        paginatedExerciseSubmissions:
          defaultExerciseSubmissionState.paginatedExerciseSubmissions,
      });
    }
    // Updating the fetchParamObjects
    patchState({
      isFetching: true,
      fetchParamObjects: state.fetchParamObjects.concat([newFetchParams]),
    });
    this.store.dispatch(
      new ToggleLoadingScreen({
        message: 'Fetching submissions...',
        showLoadingScreen: true,
      })
    );
    this.apollo
      .query({
        query: EXERCISE_SUBMISSION_QUERIES.GET_EXERCISE_SUBMISSIONS,
        variables,
        fetchPolicy: 'network-only',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ({ data }: any) => {
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
            })
          );

          const response = data.exerciseSubmissions;
          newFetchParams = { ...newFetchParams };
          let paginatedExerciseSubmissions = state.paginatedExerciseSubmissions;
          paginatedExerciseSubmissions = {
            ...paginatedExerciseSubmissions,
            [pageNumber]: response,
          };

          let exerciseSubmissions = convertPaginatedListToNormalList(
            paginatedExerciseSubmissions
          );
          let lastPage = null;
          if (response.length < newFetchParams.pageSize) {
            lastPage = newFetchParams.currentPage;
          }

          patchState({
            lastPage,
            exerciseSubmissions,
            paginatedExerciseSubmissions,
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

  @Action(ExerciseSubmissionSubscriptionAction)
  subscribeToExerciseSubmissions({
    getState,
    patchState,
  }: StateContext<ExerciseSubmissionStateModel>) {
    const state = getState();
    if (!state.exerciseSubmissionsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.exerciseSubmission,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe((result: any) => {
          const state = getState();
          const method = result?.data?.notifyExerciseSubmission?.method;
          const exerciseSubmission =
            result?.data?.notifyExerciseSubmission?.exerciseSubmission;
          // Replacing the existing submissions in state with the modified submissions in the response
          const { newPaginatedItems, newItemsList } =
            paginatedSubscriptionUpdater({
              paginatedItems: state.paginatedExerciseSubmissions,
              method,
              modifiedItem: exerciseSubmission,
            });
          patchState({
            exerciseSubmissions: newItemsList,
            paginatedExerciseSubmissions: newPaginatedItems,
            exerciseSubmissionsSubscribed: true,
          });
        });
    }
  }

  @Action(GetExerciseSubmissionAction)
  getExerciseSubmission(
    { patchState }: StateContext<ExerciseSubmissionStateModel>,
    { payload }: GetExerciseSubmissionAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .query({
        query: EXERCISE_SUBMISSION_QUERIES.GET_EXERCISE_SUBMISSION,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ({ data }: any) => {
          const response = data.exerciseSubmission;
          patchState({
            exerciseSubmissionFormRecord: response,
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

  @Action(CreateUpdateExerciseSubmissionsAction)
  createUpdateExerciseSubmission(
    { getState, patchState }: StateContext<ExerciseSubmissionStateModel>,
    { payload }: CreateUpdateExerciseSubmissionsAction
  ) {
    const state = getState();
    const { exerciseSubmissions, grading, bulkauto } = payload;
    let { formSubmitting } = state;
    formSubmitting = true;
    patchState({ formSubmitting });
    const sanitizedSubmissions =
      SanitizeSubmissionRubricToServer(exerciseSubmissions);
    const variables = {
      exerciseSubmissions: sanitizedSubmissions,
      grading,
      bulkauto: bulkauto ? bulkauto : false,
    };
    this.apollo
      .mutate({
        mutation:
          EXERCISE_SUBMISSION_MUTATIONS.CREATE_UPDATE_EXERCISE_SUBMISSIONS,
        variables,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ({ data }: any) => {
          const response = data.createUpdateExerciseSubmissions;
          patchState({ formSubmitting: false });

          if (response.ok) {
            if (grading) {
              this.router.navigateByUrl(GradingUrl);
            } else {
              this.store.dispatch(new ForceRefetchChaptersAction());
              this.store.dispatch(new ForceRefetchExercisesAction());
              this.store.dispatch(new ForceRefetchAssignmentsAction());
              this.router.navigateByUrl(AssignmentUrl);
            }
            const modifiedExerciseSubmissions = response.exerciseSubmissions;
            // Replacing the existing submissions in state with the modified submissions in the response
            let exerciseSubmissions = state.exerciseSubmissions.map((e) => {
              const modifiedSubmission = modifiedExerciseSubmissions.find(
                (m) => m.id == e.id
              );
              return modifiedSubmission ? { ...e, ...modifiedSubmission } : e;
            });
            // Getting the last used fetch params so that we can check if the returned submissions are applicable to the filters
            let previousFetchParams =
              state.fetchParamObjects[state.fetchParamObjects.length - 1];
            previousFetchParams = previousFetchParams
              ? previousFetchParams
              : startingFetchParams;
            // Filtering out submissions that are no longer valid for the current set of filters
            exerciseSubmissions = exerciseSubmissions.filter((e) => {
              const statusValid = previousFetchParams.columnFilters?.status
                ? previousFetchParams.columnFilters?.status == e?.status
                : true;
              return statusValid;
            });

            patchState({
              exerciseSubmissions,
              exerciseSubmissionFormRecord: emptyExerciseSubmissionFormRecord,
              fetchPolicy: 'network-only',
            });
            this.store.dispatch(
              new ShowNotificationAction({
                message: `Your work was submitted successfully!`,
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
          patchState({ formSubmitting: false });
        }
      );
  }

  @Action(DeleteExerciseSubmissionAction)
  deleteExerciseSubmission(
    { getState, patchState }: StateContext<ExerciseSubmissionStateModel>,
    { payload }: DeleteExerciseSubmissionAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: EXERCISE_SUBMISSION_MUTATIONS.DELETE_EXERCISE_SUBMISSION,
        variables: { id },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteExerciseSubmission;

          if (response.ok) {
            const method = SUBSCRIPTION_METHODS.DELETE_METHOD;
            const group = response.group;
            const state = getState();
            const { newPaginatedItems, newItemsList } =
              paginatedSubscriptionUpdater({
                paginatedItems: state.paginatedExerciseSubmissions,
                method,
                modifiedItem: group,
              });
            patchState({
              paginatedExerciseSubmissions: newPaginatedItems,
              exerciseSubmissions: newItemsList,
              exerciseSubmissionFormRecord: emptyExerciseSubmissionFormRecord,
            });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'ExerciseSubmission deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(new ForceRefetchExerciseSubmissionsAction());
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

  @Action(ResetExerciseSubmissionFormAction)
  resetExerciseSubmissionForm({
    patchState,
  }: StateContext<ExerciseSubmissionStateModel>) {
    patchState({
      exerciseSubmissionFormRecord: emptyExerciseSubmissionFormRecord,
      formSubmitting: false,
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
