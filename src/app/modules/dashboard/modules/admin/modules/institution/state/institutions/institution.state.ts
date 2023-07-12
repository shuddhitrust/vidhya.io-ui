import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultInstitutionState,
  emptyInstitutionFormRecord,
  fetchDesignationByInstitutionModel,
  InstitutionFormCloseURL,
  InstitutionStateModel,
} from './institution.model';

import { Injectable, NgZone } from '@angular/core';
import {
  CreateUpdateInstitutionAction,
  DeleteInstitutionAction,
  FetchInstitutionsAction,
  ForceRefetchInstitutionsAction,
  GetInstitutionAction,
  InstitutionSubscriptionAction,
  ResetInstitutionFormAction,
} from './institution.actions';
import { INSTITUTION_QUERIES } from '../../../../../../../../shared/api/graphql/queries.graphql';
import { Apollo, Subscription } from 'apollo-angular';
import {
  Institution,
  MatSelectOption,
  FetchParams,
  SUBSCRIPTION_METHODS,
  startingFetchParams,
} from '../../../../../../../../shared/common/models';
import { INSTITUTION_MUTATIONS } from '../../../../../../../../shared/api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../../../../../../../../shared/state/notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  subscriptionUpdater,
  updateFetchParams,
} from '../../../../../../../../shared/common/functions';
import { Router } from '@angular/router';
import {
  ADMIN_SECTION_LABELS,
  defaultSearchParams,
} from '../../../../../../../../shared/common/constants';
import { SUBSCRIPTIONS } from '../../../../../../../../shared/api/graphql/subscriptions.graphql';
import { SearchParams } from '../../../../../../../../shared/modules/master-grid/table.model';
@State<InstitutionStateModel>({
  name: 'institutionState',
  defaults: defaultInstitutionState,
})
@Injectable()
export class InstitutionState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router,
    private ngZone:NgZone
  ) {}

  @Selector()
  static listInstitutions(state: InstitutionStateModel): Institution[] {
    return state.institutions;
  }

  @Selector()
  static isFetching(state: InstitutionStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: InstitutionStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listInstitutionOptions(
    state: InstitutionStateModel
  ): MatSelectOption[] {
    const options: MatSelectOption[] = state.institutions.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: `${i.name} (${i.location})`,
      };
      return option;
    });

    return options;
  }

  @Selector()
  static isInstitutionModalDialog(state: InstitutionStateModel,model:fetchDesignationByInstitutionModel):Institution {
    if(state.isInstitutionModalFormOpen){
      // state.
      // Object.keys(model).forEach(element => {
        
      // });
      return state.institutionModalData;
    }
    return null;
  }

  @Selector()
  static errorFetching(state: InstitutionStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: InstitutionStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: InstitutionStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getInstitutionFormRecord(state: InstitutionStateModel): Institution {
    return state.institutionFormRecord;
  }

  @Action(ForceRefetchInstitutionsAction)
  forceRefetchInstitutions({
    getState,
    patchState,
  }: StateContext<InstitutionStateModel>) {
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
      new FetchInstitutionsAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchInstitutionsAction)
  fetchInstitutions(
    { getState, patchState }: StateContext<InstitutionStateModel>,
    { payload }: FetchInstitutionsAction
  ) {
    const state = getState();
    const { fetchPolicy, fetchParamObjects } = state;
    const { searchParams } = payload;
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
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };

    this.apollo
      .query({
        query: INSTITUTION_QUERIES.GET_INSTITUTIONS,
        variables,
        // fetchPolicy,
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.institutions.records;
          const totalCount = data.institutions.total
            ? data.institutions.total
            : 0;

          newFetchParams = { ...newFetchParams, totalCount };

          patchState({
            institutions: response,
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

  @Action(InstitutionSubscriptionAction)
  subscribeToInstitutions({
    getState,
    patchState,
  }: StateContext<InstitutionStateModel>) {
    const state = getState();
    if (!state.institutionsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.institution,
        })
        .subscribe((result: any) => {
          const state = getState();
          const method = result?.data?.notifyInstitution?.method;
          const institution = result?.data?.notifyInstitution?.institution;
          const { items, fetchParamObjects } = subscriptionUpdater({
            items: state.institutions,
            method,
            subscriptionItem: institution,
            fetchParamObjects: state.fetchParamObjects,
          });
          patchState({
            institutions: items,
            fetchParamObjects,
            institutionsSubscribed: true,
          });
        });
    }
  }

  @Action(GetInstitutionAction)
  getInstitution(
    { patchState }: StateContext<InstitutionStateModel>,
    { payload }: GetInstitutionAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .query({
        query: INSTITUTION_QUERIES.GET_INSTITUTION,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.institution;
          patchState({ institutionFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateInstitutionAction)
  createUpdateInstitution(
    { getState, patchState }: StateContext<InstitutionStateModel>,
    { payload }: CreateUpdateInstitutionAction
  ) {
    const state = getState();
    const { form, formDirective,isInstitutionModalDialog } = payload;
    let { formSubmitting,isInstitutionModalFormOpen } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting});
      const values = form.value;
      values.designations = values.designations.toString();
      const updateForm = values.id == null ? false : true;
      // values.dob = values.dob;
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
            ? INSTITUTION_MUTATIONS.UPDATE_INSTITUTION
            : INSTITUTION_MUTATIONS.CREATE_INSTITUTION,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm
              ? data.updateInstitution
              : data.createInstitution;
            patchState({ formSubmitting: false });

            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Institution ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              
              patchState({
                institutionFormRecord: emptyInstitutionFormRecord,
              });      
              if(isInstitutionModalDialog == true){
                patchState({institutionModalData:response?.institution,
                  isInstitutionModalFormOpen:isInstitutionModalDialog
                });
              }else{                         
                this.router.navigate([InstitutionFormCloseURL], {
                  queryParams: {
                    adminSection: ADMIN_SECTION_LABELS.INSTITUTIONS,
                  },
                });
              }
              
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

  @Action(DeleteInstitutionAction)
  deleteInstitution(
    {}: StateContext<InstitutionStateModel>,
    { payload }: DeleteInstitutionAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: INSTITUTION_MUTATIONS.DELETE_INSTITUTION,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteInstitution;

          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Institution deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(new ForceRefetchInstitutionsAction());
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

  @Action(ResetInstitutionFormAction)
  resetInstitutionForm({ patchState }: StateContext<InstitutionStateModel>) {
    patchState({
      institutionFormRecord: emptyInstitutionFormRecord,
      formSubmitting: false,
      isInstitutionModalFormOpen: false,
      institutionModalData:emptyInstitutionFormRecord
    });
  }

  
}
