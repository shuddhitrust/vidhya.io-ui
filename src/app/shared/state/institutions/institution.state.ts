import { State, Action, Selector, Store, StateContext } from '@ngxs/store';
import {
  defaultInstitutionState,
  emptyInstitutionFormRecord,
  InstitutionStateModel,
} from './institution.model';
import {
  CreateUpdateInstitution,
  DeleteInstitution,
  FetchInstitutions,
  ForceRefetchInstitutions,
  GetInstitution,
} from './institution.actions';
import { Injectable } from '@angular/core';

import { ShowNotificationAction } from '../notifications/notification.actions';
import { ToggleLoadingScreen } from '../loading/loading.actions';
import {
  Institution,
  MatSelectOption,
  PaginationObject,
} from '../../common/models';
import { defaultPageSize } from '../../abstract/master-grid/table.model';
import { setNextToken, updatePaginationObject } from '../../common/functions';

@State<InstitutionStateModel>({
  name: 'institutionState',
  defaults: defaultInstitutionState,
})
@Injectable()
export class InstitutionState {
  constructor(private store: Store) {}

  @Selector()
  static listInstitutions(state: InstitutionStateModel): Institution[] {
    return state.institutions;
  }

  @Selector()
  static paginationObject(state: InstitutionStateModel): PaginationObject {
    return state.paginationObject;
  }

  @Selector()
  static listInstitutionOptions(
    state: InstitutionStateModel
  ): MatSelectOption[] {
    const options = state.institutions.map((i) => {
      return { value: i.id, label: `${i.name} (${i.location})` };
    });
    console.log('options', options);
    return options;
  }

  @Selector()
  static isFetching(state: InstitutionStateModel): boolean {
    return state.isFetching;
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

  @Action(ForceRefetchInstitutions)
  forceRefetchInstitutions(
    { patchState }: StateContext<InstitutionStateModel>,
    { payload }: ForceRefetchInstitutions
  ) {
    const { searchParams } = payload;
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(new FetchInstitutions({ searchParams }));
  }

  @Action(FetchInstitutions)
  fetchInstitutions(
    { getState, patchState }: StateContext<InstitutionStateModel>,
    { payload }: FetchInstitutions
  ) {
    const { searchParams } = payload;
    const state = getState();
    let {
      institutions,
      isFetching,
      errorFetching,
      fetchPolicy,
      paginationObject,
    } = state;
    isFetching = true;
    errorFetching = false;
    paginationObject = {
      ...paginationObject,
      pageIndex: searchParams?.pageNumber
        ? searchParams?.pageNumber
        : paginationObject.pageIndex,
    };
    patchState({ isFetching, errorFetching, institutions });
    const filter = searchParams?.searchQuery
      ? {
          searchField: { contains: searchParams.searchQuery.toLowerCase() },
          // sortBy: searchParams.sortField,
        }
      : null;
    const variables = {
      filter,
      limit: searchParams?.pageSize ? searchParams?.pageSize : defaultPageSize,
      // limit: 1,
      nextToken: setNextToken(paginationObject),
    };
    // client
    //   .query({
    //     query: modifiedQueries.ListInstitutions,
    //     fetchPolicy,
    //     variables,
    //   })
    //   .then((res: any) => {
    //     isFetching = false;
    //     const institutions = res.data.listInstitutions.items;
    //     const returnedNextToken = res.data.listInstitutions.nextToken;
    //     fetchPolicy = null;
    //     paginationObject = updatePaginationObject(
    //       paginationObject,
    //       returnedNextToken
    //     );

    //     patchState({
    //       institutions,
    //       isFetching,
    //       fetchPolicy,
    //       paginationObject,
    //     });
    //   })
    //   .catch((err) => {
    //     isFetching = false;
    //     errorFetching = true;
    //     institutions = [];
    //     patchState({ institutions, isFetching, errorFetching });
    //   });
  }

  @Action(GetInstitution)
  getInstitution(
    { getState, patchState }: StateContext<InstitutionStateModel>,
    { payload }: GetInstitution
  ) {
    const { id } = payload;
    const state = getState();
    const institution = state.institutions.find((i) => i.id == id);
    if (institution) {
      patchState({ institutionFormRecord: institution });
    } else {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Fetching the institution...',
        })
      );
      // client
      //   .query({
      //     query: queries.GetInstitution,
      //     variables: {
      //       id,
      //     },
      //   })
      //   .then((res: any) => {
      //     this.store.dispatch(
      //       new ToggleLoadingScreen({ showLoadingScreen: false })
      //     );
      //     const institutionFormRecord = res.data.getInstitution;
      //     patchState({ institutionFormRecord });
      //   })
      //   .catch((res: any) => {
      //     console.error(res);
      //     this.store.dispatch(
      //       new ToggleLoadingScreen({ showLoadingScreen: false })
      //     );
      //     this.store.dispatch(
      //       new ShowNotificationAction({
      //         message:
      //           'There was an error in fetching the institution! Try again later.',
      //       })
      //     );
      //   });
    }
  }

  @Action(CreateUpdateInstitution)
  createUpdateInstitution(
    { getState, patchState }: StateContext<InstitutionStateModel>,
    { payload }: CreateUpdateInstitution
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      const values = form.value;
      const updateForm = values.id ? true : false;
      patchState({ formSubmitting });
      // client
      //   .mutate({
      //     mutation: updateForm
      //       ? mutations.UpdateInstitution
      //       : mutations.CreateInstitution,
      //     variables: {
      //       input: values,
      //     },
      //   })
      //   .then((res: any) => {
      //     this.store.dispatch(new ForceRefetchInstitutions({}));
      //     formSubmitting = false;
      //     patchState({ institutionFormRecord: emptyInstitutionFormRecord });
      //     form.reset();
      //     formDirective.resetForm();
      //     patchState({ formSubmitting });
      //     this.store.dispatch(
      //       new ShowNotificationAction({
      //         message: 'Form submitted successfully!',
      //       })
      //     );
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //     formSubmitting = false;
      //     patchState({ formSubmitting });
      //     this.store.dispatch(
      //       new ShowNotificationAction({
      //         message: 'There was an error in submitting your form!',
      //       })
      //     );
      //   });
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

  @Action(DeleteInstitution)
  deleteInstitution(
    { getState, patchState }: StateContext<InstitutionStateModel>,
    { payload }: DeleteInstitution
  ) {
    const { id } = payload;
    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Deleting the institution...',
      })
    );
    // client
    //   .mutate({
    //     mutation: mutations.DeleteInstitution,
    //     variables: {
    //       input: {
    //         id,
    //       },
    //     },
    //   })
    //   .then((res: any) => {
    //     this.store.dispatch(new ForceRefetchInstitutions({}));
    //     console.log(res);
    //     this.store.dispatch(
    //       new ToggleLoadingScreen({
    //         showLoadingScreen: false,
    //       })
    //     );
    //     this.store.dispatch(
    //       new ShowNotificationAction({
    //         message: `The institution with name ${res?.data?.deleteInstitution?.name} was successfully deleted`,
    //       })
    //     );
    //   })
    //   .catch((err) => {
    //     console.log('Error while deleting ', err);
    //     this.store.dispatch(
    //       new ToggleLoadingScreen({
    //         showLoadingScreen: false,
    //       })
    //     );
    //     this.store.dispatch(
    //       new ShowNotificationAction({
    //         message: `Something went wrong while attempting to delete the institution. It may not have been deleted.`,
    //       })
    //     );
    //   });
  }
}
