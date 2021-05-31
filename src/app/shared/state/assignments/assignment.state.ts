import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultAssignmentState,
  emptyAssignmentFormRecord,
  AssignmentFormCloseURL,
  AssignmentStateModel,
} from './assignment.model';

import { Injectable } from '@angular/core';
import {
  CreateUpdateAssignmentAction,
  DeleteAssignmentAction,
  FetchAssignmentsAction,
  ForceRefetchAssignmentsAction,
  GetAssignmentAction,
  ResetAssignmentFormAction,
} from './assignment.actions';
import { ASSIGNMENT_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Assignment,
  MatSelectOption,
  PaginationObject,
} from '../../common/models';
import { ASSIGNMENT_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  updatePaginationObject,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';

@State<AssignmentStateModel>({
  name: 'assignmentState',
  defaults: defaultAssignmentState,
})
@Injectable()
export class AssignmentState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
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
  static paginationObject(state: AssignmentStateModel): PaginationObject {
    return state.paginationObject;
  }
  @Selector()
  static listAssignmentOptions(state: AssignmentStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.assignments.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.title,
      };
      return option;
    });
    console.log('options', options);
    return options;
  }

  @Selector()
  static errorFetching(state: AssignmentStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: AssignmentStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: AssignmentStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getAssignmentFormRecord(state: AssignmentStateModel): Assignment {
    return state.assignmentFormRecord;
  }

  @Action(ForceRefetchAssignmentsAction)
  forceRefetchAssignments({ patchState }: StateContext<AssignmentStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchAssignmentsAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchAssignmentsAction)
  fetchAssignments(
    { getState, patchState }: StateContext<AssignmentStateModel>,
    { payload }: FetchAssignmentsAction
  ) {
    console.log('Fetching assignments from assignment state');
    patchState({ isFetching: true });
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, paginationObject } = state;
    const { searchQuery, newPageSize, newPageNumber } = searchParams;
    const newPaginationObject = updatePaginationObject({
      paginationObject,
      newPageNumber,
      newPageSize,
    });
    const variables = {
      searchField: searchQuery,
      limit: newPaginationObject.pageSize,
      offset: newPaginationObject.offset,
    };
    console.log('variables for assignments fetch ', { variables });
    this.apollo
      .watchQuery({
        query: ASSIGNMENT_QUERIES.GET_ASSIGNMENTS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(({ data }: any) => {
        console.log('resposne to get assignments query ', { data });
        const response = data.assignments;
        const totalCount = response[0]?.totalCount
          ? response[0]?.totalCount
          : 0;
        newPaginationObject.totalCount = totalCount;
        console.log('from after getting assignments', {
          totalCount,
          response,
          newPaginationObject,
        });
        patchState({
          assignments: response,
          paginationObject: newPaginationObject,
          isFetching: false,
        });
      });
  }

  @Action(GetAssignmentAction)
  getAssignment(
    { patchState }: StateContext<AssignmentStateModel>,
    { payload }: GetAssignmentAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: ASSIGNMENT_QUERIES.GET_ASSIGNMENT,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.assignment;
        patchState({ assignmentFormRecord: response, isFetching: false });
      });
  }

  @Action(CreateUpdateAssignmentAction)
  createUpdateAssignment(
    { getState, patchState }: StateContext<AssignmentStateModel>,
    { payload }: CreateUpdateAssignmentAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;
      console.log('Assignment Form values', values);
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
            ? ASSIGNMENT_MUTATIONS.UPDATE_ASSIGNMENT
            : ASSIGNMENT_MUTATIONS.CREATE_ASSIGNMENT,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm
              ? data.updateAssignment
              : data.createAssignment;
            patchState({ formSubmitting: false });
            console.log('update assignment ', { response });
            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Assignment ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(AssignmentFormCloseURL);
              patchState({
                assignmentFormRecord: emptyAssignmentFormRecord,
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
            console.log('From createUpdateAssignment', { response });
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

  @Action(DeleteAssignmentAction)
  deleteAssignment(
    {}: StateContext<AssignmentStateModel>,
    { payload }: DeleteAssignmentAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: ASSIGNMENT_MUTATIONS.DELETE_ASSIGNMENT,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteAssignment;
          console.log('from delete assignment ', { data });
          if (response.ok) {
            this.router.navigateByUrl(AssignmentFormCloseURL);
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Assignment deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchAssignmentsAction({
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

  @Action(ResetAssignmentFormAction)
  resetAssignmentForm({ patchState }: StateContext<AssignmentStateModel>) {
    patchState({
      assignmentFormRecord: emptyAssignmentFormRecord,
      formSubmitting: false,
    });
  }
}
