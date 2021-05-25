import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultInstitutionState,
  emptyInstitutionFormRecord,
  InstitutionStateModel,
} from './institution.model';

import { Injectable } from '@angular/core';
import {
  CreateUpdateInstitutionAction,
  FetchInstitutionsAction,
  GetInstitutionAction,
} from './institution.actions';
import { INSTITUTION_QUERIES } from './../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Institution,
  MatSelectOption,
  PaginationObject,
} from '../../common/models';
import { INSTITUTION_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import { getErrorMessageFromGraphQLResponse } from '../../common/functions';

@State<InstitutionStateModel>({
  name: 'institutionState',
  defaults: defaultInstitutionState,
})
@Injectable()
export class InstitutionState {
  constructor(private apollo: Apollo, private store: Store) {}

  @Selector()
  static listInstitutions(state: InstitutionStateModel): Institution[] {
    return state.institutions;
  }

  @Selector()
  static isFetching(state: InstitutionStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static paginationObject(state: InstitutionStateModel): PaginationObject {
    return state.paginationObject;
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
    console.log('options', options);
    return options;
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

  @Action(FetchInstitutionsAction)
  fetchInstitutions({
    getState,
    patchState,
  }: StateContext<InstitutionStateModel>) {
    patchState({ isFetching: true });
    const state = getState();
    const { fetchPolicy } = state;
    this.apollo
      .watchQuery({ query: INSTITUTION_QUERIES.GET_INSTITUTIONS, fetchPolicy })
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.institutions;
        patchState({ institutions: response, isFetching: false });
      });
  }

  @Action(GetInstitutionAction)
  getInstitution(
    { patchState }: StateContext<InstitutionStateModel>,
    { payload }: GetInstitutionAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: INSTITUTION_QUERIES.GET_INSTITUTION,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.institution;
        patchState({ institutionFormRecord: response, isFetching: false });
      });
  }

  @Action(CreateUpdateInstitutionAction)
  createUpdateInstitution(
    { getState, patchState }: StateContext<InstitutionStateModel>,
    { payload }: CreateUpdateInstitutionAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    // if (form.valid) {
    formSubmitting = true;
    patchState({ formSubmitting });
    const values = form.value;
    // values.id = parseInt(values.id, 10);
    console.log('Institution Form values', values);
    const updateForm = values.id == null ? false : true;
    this.apollo
      .mutate({
        mutation: updateForm
          ? INSTITUTION_MUTATIONS.UPDATE_INSTITUTION
          : INSTITUTION_MUTATIONS.CREATE_INSTITUTION,
        variables: {
          input: values,
          id: updateForm ? values.id : null,
        },
      })
      .subscribe(
        ({ data }: any) => {
          const response = updateForm
            ? data.updateInstitution
            : data.createInstitution;
          patchState({ formSubmitting: false });
          console.log('update institution ', { response });
          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: `Institution ${
                  updateForm ? 'updated' : 'created'
                } successfully!`,
                action: 'success',
              })
            );

            patchState({
              institutionFormRecord: emptyInstitutionFormRecord,
              fetchPolicy: 'network-only',
            });
            form.reset();
            formDirective.resetForm();
          } else {
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(response?.errors),
                action: 'error',
              })
            );
          }
          console.log('From createUpdateInstitution', { response });
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
    // } else {
    //   this.store.dispatch(
    //     new ShowNotificationAction({
    //       message:
    //         'Please make sure there are no errors in the form before attempting to submit!',
    //       action: 'error',
    //     })
    //   );
    // }
  }
}
