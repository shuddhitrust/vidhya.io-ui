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
import { Apollo } from 'apollo-angular';

import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  FetchParams,
  MatSelectOption,
  resources,
  startingFetchParams,
  UserRole,
} from 'src/app/shared/common/models';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import {
  constructPermissions,
  getErrorMessageFromGraphQLResponse,
  subscriptionUpdater,
  updateFetchParams,
} from 'src/app/shared/common/functions';
import { USER_ROLE_QUERIES } from 'src/app/shared/api/graphql/queries.graphql';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { SUBSCRIPTIONS } from 'src/app/shared/api/graphql/subscriptions.graphql';
import { USER_ROLE_MUTATIONS } from 'src/app/shared/api/graphql/mutations.graphql';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { UserCoursesComponent } from 'src/app/modules/public/components/profiles/public-user-profile/user-profile-tabs/user-profile-courses/user-profile-courses.component';
import { uiroutes } from 'src/app/shared/common/ui-routes';

@State<UserRoleStateModel>({
  name: 'roleState',
  defaults: defaultRoleState,
})
@Injectable()
export class UserRoleState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  @Selector()
  static listRoles(state: UserRoleStateModel): UserRole[] {
    return state.roles;
  }

  @Selector()
  static listRoleOptions(state: UserRoleStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.roles.map((i) => {
      const option: MatSelectOption = {
        value: i.name,
        label: `${i.name} (${i.description})`,
      };
      return option;
    });
    return options;
  }

  @Selector()
  static isFetching(state: UserRoleStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: UserRoleStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
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
  forceRefetchRoles({
    getState,
    patchState,
  }: StateContext<UserRoleStateModel>) {
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
      new FetchUserRolesAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchUserRolesAction)
  fetchRoles(
    { getState, patchState }: StateContext<UserRoleStateModel>,
    { payload }: FetchUserRolesAction
  ) {
    const { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects } = state;
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
        query: USER_ROLE_QUERIES.GET_USER_ROLES,
        variables,
        // fetchPolicy,
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.userRoles.records;
          const totalCount = data.userRoles.total ? data.userRoles.total : 0;
          newFetchParams = { ...newFetchParams, totalCount };
          patchState({
            roles: response,
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
          const method = result?.data?.notifyUserRole?.method;
          const userRole = result?.data?.notifyUserRole?.userRole;
          const { items, fetchParamObjects } = subscriptionUpdater({
            items: state.roles,
            method,
            subscriptionItem: userRole,
            fetchParamObjects: state.fetchParamObjects,
            pk: 'name',
          });
          patchState({
            roles: items,
            fetchParamObjects,
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
    const { roleName } = payload;
    patchState({ isFetching: true });
    this.apollo
      .query({
        query: USER_ROLE_QUERIES.GET_USER_ROLE,
        variables: { roleName },
        fetchPolicy: 'no-cache',
      })
      .subscribe(
        ({ data }: any) => {
          let response = data.userRole;

          const userRolePermissions = JSON.parse(
            response.permissions.toString()
          );

          const permissions = constructPermissions(userRolePermissions);
          const userRoleFormRecord = {
            id: response.id,
            name: response.name,
            priority: response.priority,
            description: response.description,
            permissions,
            createdAt: response.createdAt,
          };
          patchState({ userRoleFormRecord, isFetching: false });
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

      const updateForm = values.createdAt == null ? false : true;
      const { createdAt, ...sanitizedValues } = values;
      const variables = updateForm
        ? {
            input: sanitizedValues,
            roleName: values.name, // adding id to the mutation variables if it is an update mutation
          }
        : { input: sanitizedValues };

      const roleName = variables.input.name;
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

            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `User Role "${roleName}" ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              this.router.navigate([uiroutes.DASHBOARD_ROUTE.route], {
                queryParams: { id: null, adminSection: resources.USER_ROLE },
              });
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

          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Role deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(new ForceRefetchUserRolesAction());
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
