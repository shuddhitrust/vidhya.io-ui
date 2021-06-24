import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultGroupState,
  emptyGroupFormRecord,
  GroupFormCloseURL,
  GroupStateModel,
} from './group.model';

import { Injectable } from '@angular/core';
import {
  CreateUpdateGroupAction,
  DeleteGroupAction,
  FetchGroupsAction,
  ForceRefetchGroupsAction,
  GetGroupAction,
  GroupSubscriptionAction,
  ResetGroupFormAction,
} from './group.actions';
import { GROUP_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { Group, MatSelectOption, PaginationObject } from '../../common/models';
import { GROUP_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  paginationChanged,
  subscriptionUpdater,
  updatePaginationObject,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';
import { SUBSCRIPTIONS } from '../../api/graphql/subscriptions.graphql';

@State<GroupStateModel>({
  name: 'groupState',
  defaults: defaultGroupState,
})
@Injectable()
export class GroupState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listGroups(state: GroupStateModel): Group[] {
    return state.groups;
  }

  @Selector()
  static isFetching(state: GroupStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static paginationObject(state: GroupStateModel): PaginationObject {
    return state.paginationObject;
  }
  @Selector()
  static listGroupOptions(state: GroupStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.groups.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.name,
      };
      return option;
    });
    console.log('options', options);
    return options;
  }

  @Selector()
  static errorFetching(state: GroupStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: GroupStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: GroupStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getGroupFormRecord(state: GroupStateModel): Group {
    return state.groupFormRecord;
  }

  @Action(ForceRefetchGroupsAction)
  forceRefetchGroups({ patchState }: StateContext<GroupStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchGroupsAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchGroupsAction)
  fetchGroups(
    { getState, patchState }: StateContext<GroupStateModel>,
    { payload }: FetchGroupsAction
  ) {
    console.log('Fetching groups from group state');
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, paginationObject, groupsSubscribed } = state;
    const { newSearchQuery, newPageSize, newPageNumber } = searchParams;
    let newPaginationObject = updatePaginationObject({
      paginationObject,
      newPageNumber,
      newPageSize,
      newSearchQuery,
    });
    const variables = {
      searchField: newSearchQuery,
      limit: newPaginationObject.pageSize,
      offset: newPaginationObject.offset,
    };
    if (
      paginationChanged({ paginationObject, newPaginationObject }) ||
      !groupsSubscribed
    ) {
      patchState({ isFetching: true });
      console.log('variables for groups fetch ', { variables });
      this.apollo
        .watchQuery({
          query: GROUP_QUERIES.GET_GROUPS,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(({ data }: any) => {
          console.log('resposne to get groups query ', { data });
          const response = data.groups;
          const totalCount = response[0]?.totalCount
            ? response[0]?.totalCount
            : 0;
          newPaginationObject = { ...newPaginationObject, totalCount };
          console.log('from after getting groups', {
            totalCount,
            response,
            newPaginationObject,
          });
          patchState({
            groups: response,
            paginationObject: newPaginationObject,
            isFetching: false,
          });
          this.store.dispatch(new GroupSubscriptionAction());
        });
    }
  }

  @Action(GroupSubscriptionAction)
  subscribeToGroups({ getState, patchState }: StateContext<GroupStateModel>) {
    const state = getState();
    if (!state.groupsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.group,
        })
        .subscribe((result: any) => {
          const state = getState();
          console.log('group subscription result ', {
            groups: state.groups,
            result,
          });
          const method = result?.data?.notifyGroup?.method;
          const group = result?.data?.notifyGroup?.group;
          const { items, paginationObject } = subscriptionUpdater({
            items: state.groups,
            method,
            subscriptionItem: group,
            paginationObject: state.paginationObject,
          });
          patchState({
            groups: items,
            paginationObject,
            groupsSubscribed: true,
          });
        });
    }
  }

  @Action(GetGroupAction)
  getGroup(
    { patchState }: StateContext<GroupStateModel>,
    { payload }: GetGroupAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: GROUP_QUERIES.GET_GROUP,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.group;
        patchState({ groupFormRecord: response, isFetching: false });
      });
  }

  @Action(CreateUpdateGroupAction)
  createUpdateGroup(
    { getState, patchState }: StateContext<GroupStateModel>,
    { payload }: CreateUpdateGroupAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;
      console.log('Group Form values', values);
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
            ? GROUP_MUTATIONS.UPDATE_GROUP
            : GROUP_MUTATIONS.CREATE_GROUP,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm ? data.updateGroup : data.createGroup;
            patchState({ formSubmitting: false });
            console.log('update group ', { response });
            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Group ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(GroupFormCloseURL);
              patchState({
                groupFormRecord: emptyGroupFormRecord,
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
            console.log('From createUpdateGroup', { response });
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

  @Action(DeleteGroupAction)
  deleteGroup(
    {}: StateContext<GroupStateModel>,
    { payload }: DeleteGroupAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: GROUP_MUTATIONS.DELETE_GROUP,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteGroup;
          console.log('from delete group ', { data });
          if (response.ok) {
            this.router.navigateByUrl(GroupFormCloseURL);
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Group deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchGroupsAction({
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

  @Action(ResetGroupFormAction)
  resetGroupForm({ patchState }: StateContext<GroupStateModel>) {
    patchState({
      groupFormRecord: emptyGroupFormRecord,
      formSubmitting: false,
    });
  }
}
