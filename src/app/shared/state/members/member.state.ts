import {
  Action,
  Select,
  Selector,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import {
  defaultMemberState,
  emptyMemberFormRecord,
  MemberFormCloseURL,
  MemberStateModel,
} from './member.model';

import { Injectable } from '@angular/core';
import {
  ApproveMemberAction,
  CreateUpdateMemberAction,
  DeleteMemberAction,
  FetchMembersAction,
  FetchPublicMembersAction,
  ForceRefetchMembersAction,
  GetMemberAction,
  MemberSubscriptionAction,
  ResetMemberFormAction,
  SuspendMemberAction,
} from './member.actions';
import { AUTH_QUERIES, USER_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { User, MatSelectOption, FetchParams } from '../../common/models';
import { USER_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  fetchParamsNewOrNot,
  subscriptionUpdater,
  updateFetchParams,
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
import { uiroutes } from '../../common/ui-routes';

@State<MemberStateModel>({
  name: 'memberState',
  defaults: defaultMemberState,
})
@Injectable()
export class MemberState {
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
  static listMembers(state: MemberStateModel): User[] {
    return state.members;
  }

  @Selector()
  static isFetching(state: MemberStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: MemberStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }

  @Selector()
  static errorFetching(state: MemberStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: MemberStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: MemberStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getMemberFormRecord(state: MemberStateModel): User {
    return state.memberFormRecord;
  }

  @Action(ForceRefetchMembersAction)
  forceRefetchMembers({ patchState }: StateContext<MemberStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchMembersAction({
        searchParams: defaultSearchParams,
      })
    );
  }

  @Action(FetchMembersAction)
  fetchMembers(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: FetchMembersAction
  ) {
    const state = getState();
    const { searchParams } = payload;
    const { fetchPolicy, fetchParamObjects, membersSubscribed } = state;
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
      membershipStatusNot: columnFilters.membershipStatusNot,
      membershipStatusIs: columnFilters.membershipStatusIs,
      roleName: columnFilters.roleName,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    
    this.apollo
      .watchQuery({
        query: USER_QUERIES.GET_USERS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.users;
          const totalCount = response[0]?.totalCount
            ? response[0]?.totalCount
            : 0;
          newFetchParams = { ...newFetchParams, totalCount };
          patchState({
            members: response,
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

  @Action(FetchPublicMembersAction)
  fetchPublicMembers(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: FetchMembersAction
  ) {
    const state = getState();
    const { searchParams } = payload;
    const { fetchPolicy, fetchParamObjects, membersSubscribed } = state;
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
      membershipStatusNot: columnFilters.membershipStatusNot,
      membershipStatusIs: columnFilters.membershipStatusIs,
      roleName: columnFilters.roleName,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    
    this.apollo
      .watchQuery({
        query: USER_QUERIES.GET_PUBLIC_USERS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.publicUsers;
          const totalCount = response[0]?.totalCount
            ? response[0]?.totalCount
            : 0;
          newFetchParams = { ...newFetchParams, totalCount };
          patchState({
            members: response,
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
  @Action(MemberSubscriptionAction)
  subscribeToMembers({ getState, patchState }: StateContext<MemberStateModel>) {
    const state = getState();
    if (!state.membersSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.user,
        })
        .subscribe((result: any) => {
          const state = getState();
          const method = result?.data?.notifyUser?.method;
          const member = result?.data?.notifyUser?.member;
          const { items, fetchParamObjects } = subscriptionUpdater({
            items: state.members,
            method,
            subscriptionItem: member,
            fetchParamObjects: state.fetchParamObjects,
          });
          patchState({
            members: items,
            fetchParamObjects,
            membersSubscribed: true,
          });
        });
    }
  }

  @Action(GetMemberAction)
  getMember(
    { patchState }: StateContext<MemberStateModel>,
    { payload }: GetMemberAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: USER_QUERIES.GET_USER,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.member;
          patchState({ memberFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateMemberAction)
  createUpdateMember(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: CreateUpdateMemberAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;
      
      const { id, ...sanitizedValues } = values;
      const variables = {
        input: sanitizedValues,
        // id: values.id, // adding id to the mutation variables if it is an update mutation
      };

      this.apollo
        .mutate({
          mutation: USER_MUTATIONS.UPDATE_USER,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.updateUser;
            patchState({ formSubmitting: false });
            
            if (response.ok) {
              const user = response?.user;
              
              this.store.dispatch(new UpdateCurrentUserInStateAction({ user }));
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Member updated successfully!`,
                  action: 'success',
                })
              );
              if (this.firstTimeSetup) {
                this.router.navigateByUrl(uiroutes.HOME_ROUTE.route);
              } else {
                this.router.navigate([MemberFormCloseURL]);
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

  @Action(DeleteMemberAction)
  deleteMember(
    {}: StateContext<MemberStateModel>,
    { payload }: DeleteMemberAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: USER_MUTATIONS.DELETE_USER,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteMember;
          
          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Member deleted successfully!',
                action: 'success',
              })
            );
            // this.store.dispatch(
            //   new ForceRefetchMembersAction({
            //     searchParams: defaultSearchParams,
            //   })
            // );
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

  @Action(ApproveMemberAction)
  approveUser(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: ApproveMemberAction
  ) {
    let { userId, roleName } = payload;
    this.apollo
      .mutate({
        mutation: USER_MUTATIONS.APPROVE_USER,
        variables: { userId, roleName },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.approveUser;
          
          if (response.ok) {
            const state = getState();
            const newMembers = state.members.filter(
              (m) => m.id != response?.user?.id
            );
            patchState({ members: newMembers });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Member approved successfully!',
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

  @Action(SuspendMemberAction)
  suspendUser(
    {}: StateContext<MemberStateModel>,
    { payload }: SuspendMemberAction
  ) {
    let { userId, remarks } = payload;
    this.apollo
      .mutate({
        mutation: USER_MUTATIONS.SUSPEND_USER,
        variables: { userId, remarks },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.suspendUser;
          
          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Member suspended successfully!',
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

  @Action(ResetMemberFormAction)
  resetMemberForm({ patchState }: StateContext<MemberStateModel>) {
    patchState({
      memberFormRecord: emptyMemberFormRecord,
      formSubmitting: false,
    });
  }
}
