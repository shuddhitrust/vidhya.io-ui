import {
  Action,
  Select,
  Selector,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import {
  defaultRoleState,
  emptyUserRoleFormRecord,
  UserRoleFormCloseURL,
  UserRoleStateModel,
} from './userRole.model';

import { Injectable } from '@angular/core';
import {
  CreateUpdateUserRoleAction,
  DeleteUserRoleAction,
  FetchUserRolesAction,
  ForceRefetchUserRolesAction,
  GetUserRoleAction,
  ResetUserRoleFormAction,
  UserRoleSubscriptionAction,
} from './userRole.actions';
import { USER_ROLE_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  User,
  MatSelectOption,
  PaginationObject,
  UserRole,
} from '../../common/models';
import { USER_ROLE_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  paginationChanged,
  subscriptionUpdater,
  updatePaginationObject,
} from '../../common/functions';
import { defaultSearchParams } from '../../common/constants';
import {
  GetCurrentUserAction,
  LogoutAction,
  UpdateCurrentUserInStateAction,
} from '../auth/auth.actions';
import { Router } from '@angular/router';
import { AuthState } from '../auth/auth.state';
import { Observable } from 'rxjs';
import { SUBSCRIPTIONS } from '../../api/graphql/subscriptions.graphql';

@State<UserRoleStateModel>({
  name: 'roleState',
  defaults: defaultRoleState,
})
@Injectable()
export class UserRoleState {
  firstTimeSetup: boolean = false;
  @Select(AuthState.getFirstTimeSetup)
  firstTimeSetup$: Observable<boolean>;
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {
    this.firstTimeSetup$.subscribe((val) => {
      this.firstTimeSetup = val;
    });
  }

  @Selector()
  static listRoles(state: UserRoleStateModel): UserRole[] {
    return state.roles;
  }

  @Selector()
  static isFetching(state: UserRoleStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static paginationObject(state: UserRoleStateModel): PaginationObject {
    return state.paginationObject;
  }

  @Selector()
  static errorFetching(state: UserRoleStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: UserRoleStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: UserRoleStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getUserRoleFormRecord(state: UserRoleStateModel): UserRole {
    return state.userRoleFormRecord;
  }

  @Action(ForceRefetchUserRolesAction)
  forceRefetchRoles({ patchState }: StateContext<UserRoleStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchUserRolesAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchUserRolesAction)
  fetchRoles(
    { getState, patchState }: StateContext<UserRoleStateModel>,
    { payload }: FetchUserRolesAction
  ) {
    const { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, paginationObject, userRolesSubscribed } = state;
    const { newSearchQuery, newPageSize, newPageNumber } = searchParams;
    let newPaginationObject = updatePaginationObject({
      paginationObject,
      newPageNumber,
      newPageSize,
      newSearchQuery,
    });
    if (
      paginationChanged({ paginationObject, newPaginationObject }) ||
      !userRolesSubscribed
    ) {
      patchState({ isFetching: true });
      console.log('new pagination object after the update method => ', {
        newPaginationObject,
      });
      const variables = {
        searchField: newSearchQuery,
        limit: newPaginationObject.pageSize,
        offset: newPaginationObject.offset,
      };
      console.log('variables for roles fetch ', { variables });
      this.apollo
        .watchQuery({
          query: USER_ROLE_QUERIES.GET_USER_ROLES,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(({ data }: any) => {
          const response = data.userRoles;
          const totalCount = response[0]?.totalCount
            ? response[0]?.totalCount
            : 0;
          newPaginationObject = { ...newPaginationObject, totalCount };
          console.log('from after getting roles', {
            totalCount,
            response,
            newPaginationObject,
          });
          patchState({
            roles: response,
            paginationObject: newPaginationObject,
            isFetching: false,
          });
          this.store.dispatch(new UserRoleSubscriptionAction());
        });
    }
  }

  @Action(UserRoleSubscriptionAction)
  subscribeToUserRoles({
    getState,
    patchState,
  }: StateContext<UserRoleStateModel>) {
    const state = getState();
    if (!state.userRolesSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.userRole,
        })
        .subscribe((result: any) => {
          const state = getState();
          console.log('userRole subscription result ', {
            userRoles: state.roles,
            result,
          });
          const method = result?.data?.notifyUser?.method;
          const member = result?.data?.notifyUser?.member;
          const { items, paginationObject } = subscriptionUpdater({
            items: state.roles,
            method,
            subscriptionItem: member,
            paginationObject: state.paginationObject,
          });
          patchState({
            roles: items,
            paginationObject,
            userRolesSubscribed: true,
          });
        });
    }
  }

  @Action(GetUserRoleAction)
  getRole(
    { patchState }: StateContext<UserRoleStateModel>,
    { payload }: GetUserRoleAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: USER_ROLE_QUERIES.GET_USER_ROLE,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(({ data }: any) => {
        let response = data.userRole;
        const resourcePermissions = JSON.parse(response.resourcePermissions);
        const userRoleFormRecord = {
          id: response.id,
          name: response.name,
          description: response.description,
          resourcePermissions,
        };
        patchState({ userRoleFormRecord, isFetching: false });
      });
  }

  @Action(CreateUpdateUserRoleAction)
  createUpdateUserRole(
    { getState, patchState }: StateContext<UserRoleStateModel>,
    { payload }: CreateUpdateUserRoleAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;
      console.log('UserRole Form values', values);
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
            ? USER_ROLE_MUTATIONS.UPDATE_USER_ROLE
            : USER_ROLE_MUTATIONS.CREATE_USER_ROLE,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm
              ? data.updateUserRole
              : data.createUserRole;
            patchState({ formSubmitting: false });
            console.log('update userRole ', { response });
            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `UserRole ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(UserRoleFormCloseURL);
              patchState({
                userRoleFormRecord: emptyUserRoleFormRecord,
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
            console.log('From createUpdateUserRole', { response });
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

  @Action(DeleteUserRoleAction)
  deleteRole(
    {}: StateContext<UserRoleStateModel>,
    { payload }: DeleteUserRoleAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: USER_ROLE_MUTATIONS.DELETE_USER_ROLE,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteUserRole;
          console.log('from delete role ', { data });
          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Role deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchUserRolesAction({
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

  @Action(ResetUserRoleFormAction)
  resetRoleForm({ patchState }: StateContext<UserRoleStateModel>) {
    patchState({
      userRoleFormRecord: emptyUserRoleFormRecord,
      formSubmitting: false,
    });
  }
}
