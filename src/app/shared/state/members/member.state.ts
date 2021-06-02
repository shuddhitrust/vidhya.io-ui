import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultMemberState,
  emptyMemberFormRecord,
  MemberStateModel,
} from './member.model';

import { Injectable } from '@angular/core';
import {
  CreateUpdateMemberAction,
  DeleteMemberAction,
  FetchMembersAction,
  ForceRefetchMembersAction,
  GetMemberAction,
  ResetMemberFormAction,
} from './member.actions';
import { AUTH_QUERIES, USER_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { User, MatSelectOption, PaginationObject } from '../../common/models';
import { USER_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  updatePaginationObject,
} from '../../common/functions';
import { defaultSearchParams } from '../../common/constants';
import {
  GetCurrentUserAction,
  LogoutAction,
  UpdateCurrentUserInStateAction,
} from '../auth/auth.actions';
import { Router } from '@angular/router';

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
  ) {}

  @Selector()
  static listMembers(state: MemberStateModel): User[] {
    return state.members;
  }

  @Selector()
  static isFetching(state: MemberStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static paginationObject(state: MemberStateModel): PaginationObject {
    return state.paginationObject;
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
      new FetchMembersAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchMembersAction)
  fetchMembers(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: FetchMembersAction
  ) {
    patchState({ isFetching: true });
    const { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, paginationObject } = state;
    const { searchQuery, newPageSize, newPageNumber } = searchParams;
    const newPaginationObject = updatePaginationObject({
      paginationObject,
      newPageNumber,
      newPageSize,
    });
    console.log('new pagination object after the update method => ', {
      newPaginationObject,
    });
    const variables = {
      searchField: searchQuery,
      limit: newPaginationObject.pageSize,
      offset: newPaginationObject.offset,
    };
    console.log('variables for members fetch ', { variables });
    this.apollo
      .watchQuery({
        query: USER_QUERIES.GET_USERS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.users;
        const totalCount = response[0]?.totalCount
          ? response[0]?.totalCount
          : 0;
        newPaginationObject.totalCount = totalCount;
        console.log('from after getting members', {
          totalCount,
          response,
          newPaginationObject,
        });
        patchState({
          members: response,
          paginationObject: newPaginationObject,
          isFetching: false,
        });
      });
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
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.member;
        patchState({ memberFormRecord: response, isFetching: false });
      });
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
      console.log('Member Form values', values);
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
            console.log('update member ', { response });
            if (response.ok) {
              const user = response?.updateUser;
              this.store.dispatch(new UpdateCurrentUserInStateAction({ user }));
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Member updated successfully!`,
                  action: 'success',
                })
              );
              this.router.navigateByUrl('/');
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
            console.log('From createUpdateMember', { response });
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
          console.log('from delete member ', { data });
          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Member deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchMembersAction({
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

  @Action(ResetMemberFormAction)
  resetMemberForm({ patchState }: StateContext<MemberStateModel>) {
    patchState({
      memberFormRecord: emptyMemberFormRecord,
      formSubmitting: false,
    });
  }
}
