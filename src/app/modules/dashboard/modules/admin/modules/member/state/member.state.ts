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
  MemberStateModel,
} from './member.model';

import { Injectable } from '@angular/core';
import {
  ApproveMemberAction,
  CreateUpdateMemberAction,
  DeleteMemberAction,
  FetchMembersAction,
  ForceRefetchMembersAction,
  GetMemberAction,
  MemberSubscriptionAction,
  ResetMemberFormAction,
  SuspendMemberAction,
} from './member.actions';
import { USER_QUERIES } from '../../../../../../../shared/api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  User,
  FetchParams,
  startingFetchParams,
  CurrentMember,
} from '../../../../../../../shared/common/models';
import { USER_MUTATIONS } from '../../../../../../../shared/api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../../../../../../../shared/state/notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  subscriptionUpdater,
  updateFetchParams,
} from '../../../../../../../shared/common/functions';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SUBSCRIPTIONS } from '../../../../../../../shared/api/graphql/subscriptions.graphql';
import { uiroutes } from '../../../../../../../shared/common/ui-routes';
import { SearchParams } from '../../../../../../../shared/modules/master-grid/table.model';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { UpdateCurrentUserInStateAction } from 'src/app/modules/auth/state/auth.actions';
import moment from 'moment';

@State<MemberStateModel>({
  name: 'memberState',
  defaults: defaultMemberState,
})
@Injectable()
export class MemberState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) { }

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
  forceRefetchMembers({
    getState,
    patchState,
  }: StateContext<MemberStateModel>) {
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
      new FetchMembersAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchMembersAction)
  fetchMembers(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: FetchMembersAction
  ) {
    const state = getState();
    const { searchParams } = payload;
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
      membershipStatusNot: columnFilters.membershipStatusNot,
      membershipStatusIs: columnFilters.membershipStatusIs,
      roles: columnFilters.roles,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };

    this.apollo
      .query({
        query: USER_QUERIES.GET_USERS,
        variables,
        // fetchPolicy,
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.users.records;
          const totalCount = data.users.total ? data.users.total : 0;
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
      .query({
        query: USER_QUERIES.GET_USER,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .subscribe(
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
    const { form, formDirective, username } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      let values: any = {};
      Object.keys(form.value).forEach(elem => {
        if (elem != 'id') {
          values = Object.assign({}, values, form.value[elem]);
          values.dob = JSON.parse(JSON.stringify(values.dob));
        } else {
          values = Object.assign({}, values, { 'id': form.value['id'] });
        }
      })
      // const values = Object.assign({},form.value['profile'],form.value['id'],form.value['institution'],form.value['contact'],form.value['accountSetting']);
      // if (username != values.email) {
      //   delete values.username;
      // }
      const { institutionType, ...sanitizedValues } = values;
      const variables = {
        input: sanitizedValues,
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
              // if (firstTimeSetup) {
              //   this.router.navigateByUrl(uiroutes.HOME_ROUTE.route);
              // } else {
              //   this.router.navigate([
              //     uiroutes.MEMBER_PROFILE_ROUTE.route + '/' + username,
              //   ]);
              // }
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
    { }: StateContext<MemberStateModel>,
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
    { }: StateContext<MemberStateModel>,
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
