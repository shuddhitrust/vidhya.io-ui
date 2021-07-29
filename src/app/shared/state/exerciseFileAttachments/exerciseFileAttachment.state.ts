import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultExerciseFileAttachmentState,
  emptyExerciseFileAttachmentFormRecord,
  ExerciseFileAttachmentFormCloseURL,
  ExerciseFileAttachmentStateModel,
} from './exerciseFileAttachment.model';

import { Injectable } from '@angular/core';
import {
  ExerciseFileAttachmentSubscriptionAction,
  CreateUpdateExerciseFileAttachmentAction,
  DeleteExerciseFileAttachmentAction,
  FetchExerciseFileAttachmentsAction,
  FetchNextExerciseFileAttachmentsAction,
  ForceRefetchExerciseFileAttachmentsAction,
  GetExerciseFileAttachmentAction,
  ResetExerciseFileAttachmentFormAction,
} from './exerciseFileAttachment.actions';
import { EXERCISE_FILE_ATTACHMENT_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  ExerciseFileAttachment,
  MatSelectOption,
  FetchParams,
} from '../../common/models';
import { EXERCISE_FILE_ATTACHMENT_MUTATIONS } from '../../api/graphql/mutations.graphql';
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

@State<ExerciseFileAttachmentStateModel>({
  name: 'exerciseFileAttachmentState',
  defaults: defaultExerciseFileAttachmentState,
})
@Injectable()
export class ExerciseFileAttachmentState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listExerciseFileAttachments(state: ExerciseFileAttachmentStateModel): ExerciseFileAttachment[] {
    return state.exerciseFileAttachments;
  }

  @Selector()
  static isFetching(state: ExerciseFileAttachmentStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: ExerciseFileAttachmentStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listExerciseFileAttachmentOptions(
    state: ExerciseFileAttachmentStateModel
  ): MatSelectOption[] {
    const options: MatSelectOption[] = state.exerciseFileAttachments.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.description,
      };
      return option;
    });
    console.log('options', options);
    return options;
  }

  @Selector()
  static errorFetching(state: ExerciseFileAttachmentStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: ExerciseFileAttachmentStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: ExerciseFileAttachmentStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getExerciseFileAttachmentFormRecord(
    state: ExerciseFileAttachmentStateModel
  ): ExerciseFileAttachment {
    return state.exerciseFileAttachmentFormRecord;
  }

  @Action(ForceRefetchExerciseFileAttachmentsAction)
  forceRefetchExerciseFileAttachments({
    patchState,
  }: StateContext<ExerciseFileAttachmentStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchExerciseFileAttachmentsAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchNextExerciseFileAttachmentsAction)
  fetchNextExerciseFileAttachments({ getState }: StateContext<ExerciseFileAttachmentStateModel>) {
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
        new FetchExerciseFileAttachmentsAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchExerciseFileAttachmentsAction)
  fetchExerciseFileAttachments(
    { getState, patchState }: StateContext<ExerciseFileAttachmentStateModel>,
    { payload }: FetchExerciseFileAttachmentsAction
  ) {
    console.log('Fetching exerciseFileAttachments from exerciseFileAttachment state');
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects, exerciseFileAttachmentsSubscribed } = state;
    const { newSearchQuery, newPageSize, newPageNumber, newColumnFilters } =
      searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber,
      newPageSize,
      newSearchQuery,
      newColumnFilters,
    });
    const variables = {
      searchField: newSearchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    if (fetchParamsNewOrNot({ fetchParamObjects, newFetchParams })) {
      patchState({ isFetching: true });
      console.log('variables for exerciseFileAttachments fetch ', { variables });
      this.apollo
        .watchQuery({
          query: EXERCISE_FILE_ATTACHMENT_QUERIES.GET_EXERCISE_FILE_ATTACHMENTS,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(
          ({ data }: any) => {
            console.log('resposne to get exerciseFileAttachments query ', { data });
            const response = data.exerciseFileAttachments;
            const totalCount = response[0]?.totalCount
              ? response[0]?.totalCount
              : 0;
            newFetchParams = { ...newFetchParams, totalCount };
            console.log('from after getting exerciseFileAttachments', {
              totalCount,
              response,
              newFetchParams,
            });
            let exerciseFileAttachments = state.exerciseFileAttachments;
            exerciseFileAttachments = exerciseFileAttachments.concat(response);
            let lastPage = null;
            if (response.length < newFetchParams.pageSize) {
              lastPage = newFetchParams.currentPage;
            }
            patchState({
              lastPage,
              exerciseFileAttachments,
              fetchParamObjects: state.fetchParamObjects.concat([
                newFetchParams,
              ]),
              isFetching: false,
            });
            if (!exerciseFileAttachmentsSubscribed) {
              this.store.dispatch(new ExerciseFileAttachmentSubscriptionAction());
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

  @Action(ExerciseFileAttachmentSubscriptionAction)
  subscribeToExerciseFileAttachments({
    getState,
    patchState,
  }: StateContext<ExerciseFileAttachmentStateModel>) {
    const state = getState();
    if (!state.exerciseFileAttachmentsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.exerciseFileAttachment,
        })
        .subscribe((result: any) => {
          const state = getState();
          console.log('exerciseFileAttachment subscription result ', {
            exerciseFileAttachments: state.exerciseFileAttachments,
            result,
          });
          const method = result?.data?.notifyExerciseFileAttachment?.method;
          const exerciseFileAttachment = result?.data?.notifyExerciseFileAttachment?.exerciseFileAttachment;
          const { items, fetchParamObjects } = subscriptionUpdater({
            items: state.exerciseFileAttachments,
            method,
            subscriptionItem: exerciseFileAttachment,
            fetchParamObjects: state.fetchParamObjects,
          });
          patchState({
            exerciseFileAttachments: items,
            fetchParamObjects,
            exerciseFileAttachmentsSubscribed: true,
          });
        });
    }
  }

  @Action(GetExerciseFileAttachmentAction)
  getExerciseFileAttachment(
    { patchState }: StateContext<ExerciseFileAttachmentStateModel>,
    { payload }: GetExerciseFileAttachmentAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: EXERCISE_FILE_ATTACHMENT_QUERIES.GET_EXERCISE_FILE_ATTACHMENT,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.exerciseFileAttachment;
          patchState({ exerciseFileAttachmentFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateExerciseFileAttachmentAction)
  createUpdateExerciseFileAttachment(
    { getState, patchState }: StateContext<ExerciseFileAttachmentStateModel>,
    { payload }: CreateUpdateExerciseFileAttachmentAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;
      console.log('ExerciseFileAttachment Form values', values);
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
            ? EXERCISE_FILE_ATTACHMENT_MUTATIONS.UPDATE_EXERCISE_FILE_ATTACHMENT
            : EXERCISE_FILE_ATTACHMENT_MUTATIONS.CREATE_EXERCISE_FILE_ATTACHMENT,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm
              ? data.updateExerciseFileAttachment
              : data.createExerciseFileAttachment;
            patchState({ formSubmitting: false });
            console.log('update exerciseFileAttachment ', { response });
            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `ExerciseFileAttachment ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(ExerciseFileAttachmentFormCloseURL);
              patchState({
                exerciseFileAttachmentFormRecord: emptyExerciseFileAttachmentFormRecord,
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
            console.log('From createUpdateExerciseFileAttachment', { response });
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

  @Action(DeleteExerciseFileAttachmentAction)
  deleteExerciseFileAttachment(
    {}: StateContext<ExerciseFileAttachmentStateModel>,
    { payload }: DeleteExerciseFileAttachmentAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: EXERCISE_FILE_ATTACHMENT_MUTATIONS.DELETE_EXERCISE_FILE_ATTACHMENT,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteExerciseFileAttachment;
          console.log('from delete exerciseFileAttachment ', { data });
          if (response.ok) {
            this.router.navigateByUrl(ExerciseFileAttachmentFormCloseURL);
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'ExerciseFileAttachment deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchExerciseFileAttachmentsAction({
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

  @Action(ResetExerciseFileAttachmentFormAction)
  resetExerciseFileAttachmentForm({ patchState }: StateContext<ExerciseFileAttachmentStateModel>) {
    patchState({
      exerciseFileAttachmentFormRecord: emptyExerciseFileAttachmentFormRecord,
      formSubmitting: false,
    });
  }
}
