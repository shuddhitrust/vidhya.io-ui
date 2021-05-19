import {
  State,
  Action,
  Selector,
  Store,
  StateContext,
  actionMatcher,
  Select,
} from '@ngxs/store';
import {
  defaultGroupState,
  emptyGroupFormRecord,
  GroupStateModel,
} from './group.model';
import {
  CreateUpdateGroup,
  DeleteGroup,
  FetchGroups,
  ForceRefetchGroups,
  GetGroup,
  ResetGroupForm,
} from './group.actions';
import { Injectable } from '@angular/core';
import { ShowNotificationAction } from '../notifications/notification.actions';
import { ToggleLoadingScreen } from '../loading/loading.actions';
import { MatSelectOption } from '../../common/models';
import {
  BulkCreateGroupMembers,
  BulkDeleteGroupMembers,
} from '../groupMembers/group-members.actions';
import { GroupMemberState } from '../groupMembers/group-members.state';

@State<GroupStateModel>({
  name: 'groupState',
  defaults: defaultGroupState,
})
@Injectable()
export class GroupState {
  // @Select(GroupMemberState.getBulkAddingGroupMembersSuccessful)
  // bulkAddingGroupMembersSuccessful$;
  // bulkAddingGroupMembersSuccessful: boolean;
  // @Select(GroupMemberState.getBulkDeletingGroupMembersSuccessful)
  // bulkDeletingGroupMembersSuccessful$;
  // bulkDeletingGroupMembersSuccessful: boolean;
  constructor(private store: Store) {
    // this.bulkAddingGroupMembersSuccessful$.subscribe((val) => {
    //   this.bulkAddingGroupMembersSuccessful = val;
    // });
    // this.bulkDeletingGroupMembersSuccessful$.subscribe((val) => {
    //   this.bulkDeletingGroupMembersSuccessful = val;
    // });
  }

  @Selector()
  static listGroups(state: GroupStateModel) {
    return state.groups;
  }

  @Selector()
  static listGroupOptions(state: GroupStateModel): MatSelectOption[] {
    return state.groups.map((g) => {
      return { value: g.id, label: g.name };
    });
  }

  @Selector()
  static isFetching(state: GroupStateModel) {
    return state.isFetching;
  }

  @Selector()
  static isFetchingFormRecord(state: GroupStateModel) {
    return state.isFetchingFormRecord;
  }

  @Selector()
  static groupFormRecord(state: GroupStateModel) {
    return state.groupFormRecord;
  }

  @Selector()
  static errorFetching(state: GroupStateModel) {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: GroupStateModel) {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: GroupStateModel) {
    return state.errorSubmitting;
  }

  @Selector()
  static getGroupFormRecord(state: GroupStateModel) {
    return state.groupFormRecord;
  }

  @Action(ForceRefetchGroups)
  fetchGroupsFromNetwork({ patchState }: StateContext<GroupStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
  }

  @Action(FetchGroups)
  fetchGroups({ getState, patchState }: StateContext<GroupStateModel>) {
    const state = getState();
    let { groups, isFetching, errorFetching, fetchPolicy } = state;
    isFetching = true;
    errorFetching = false;
    patchState({ isFetching, errorFetching, groups });
    // client
    //   .query({
    //     query: queries.ListGroups,
    //     fetchPolicy: fetchPolicy,
    //   })
    //   .then((res: any) => {
    //     console.log('Fetched groups => ', res);
    //     isFetching = false;
    //     const groups = res.data.listGroups.items;
    //     fetchPolicy = null;
    //     patchState({ groups, isFetching, fetchPolicy });
    //   })
    //   .catch((err) => {
    //     console.error('There was an error while fetching groups => ', err);
    //     isFetching = false;
    //     errorFetching = true;
    //     groups = [];
    //     patchState({ groups, isFetching, errorFetching });
    //   });
  }

  @Action(GetGroup)
  getGroup(
    { getState, patchState }: StateContext<GroupStateModel>,
    { payload }: GetGroup
  ) {
    const { id } = payload;
    const state = getState();
    let { isFetchingFormRecord, errorFetchingFormRecord } = state;
    const groupFound = state.groups.find((i) => i.id == id);
    if (groupFound) {
      patchState({ groupFormRecord: groupFound });
    } else {
      patchState({
        isFetchingFormRecord: true,
        errorFetchingFormRecord: false,
      });
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Fetching the group...',
        })
      );
      // client
      //   .query({
      //     query: queries.GetGroup,
      //     variables: {
      //       id,
      //     },
      //   })
      //   .then((res: any) => {
      //     patchState({ isFetchingFormRecord: false });
      //     this.store.dispatch(
      //       new ToggleLoadingScreen({ showLoadingScreen: false })
      //     );
      //     const groupFormRecord = res.data.getGroup;

      //     patchState({ groupFormRecord });
      //   })
      //   .catch((res: any) => {
      //     console.error(res);
      //     patchState({
      //       isFetchingFormRecord: false,
      //       errorFetchingFormRecord: true,
      //     });
      //     this.store.dispatch(
      //       new ToggleLoadingScreen({ showLoadingScreen: false })
      //     );
      //     this.store.dispatch(
      //       new ShowNotificationAction({
      //         message:
      //           'There was an error in fetching the group! Try again later.',
      //       })
      //     );
      //   });
    }
  }

  @Action(ResetGroupForm)
  resetGroupForm({ patchState }: StateContext<GroupStateModel>) {
    patchState({ groupFormId: null, groupFormRecord: emptyGroupFormRecord });
  }

  @Action(CreateUpdateGroup)
  createUpdateGroup(
    { getState, patchState }: StateContext<GroupStateModel>,
    { payload }: CreateUpdateGroup
  ) {
    function groupUpdateSuccess({ form, formDirective, patchState, store }) {
      console.log('executing groupUpdateSuccess method inside the function');
      const formSubmitting = false;
      form.reset();
      formDirective.resetForm();
      patchState({
        groupFormRecord: emptyGroupFormRecord,
        formSubmitting,
      });
      store.dispatch(new ForceRefetchGroups());
      store.dispatch(
        new ShowNotificationAction({
          message: 'Form submitted successfully!',
        })
      );
    }
    const state = getState();
    console.log('Actual state for create Group starts here ');
    const { form, formDirective, addMemberIds, removeMemberIds } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      console.log('Group form is valid');
      formSubmitting = true;
      const values = form.value;
      const { members, ...sanitzedValues } = values;
      const updateForm = sanitzedValues.id ? true : false;
      patchState({ formSubmitting });
      if (updateForm) {
        // client
        //   .mutate({
        //     mutation: updateForm
        //       ? mutations.UpdateGroup
        //       : mutations.CreateGroup,
        //     variables: {
        //       input: sanitzedValues,
        //     },
        //   })
        //   .then((res: any) => {
        //     console.log('update group resulted in success', { res });
        //     const groupId = res.data?.updateGroup?.id;
        //     if (groupId) {
        //       if (addMemberIds.length || removeMemberIds.length) {
        //         if (addMemberIds.length) {
        //           this.store.dispatch(
        //             new BulkCreateGroupMembers({
        //               groupId,
        //               memberIds: addMemberIds,
        //             })
        //           );
        //         }
        //         if (removeMemberIds.length) {
        //           this.store.dispatch(
        //             new BulkDeleteGroupMembers({
        //               groupId,
        //               memberIds: removeMemberIds,
        //             })
        //           );
        //         }
        //         if (
        //           this.bulkAddingGroupMembersSuccessful &&
        //           this.bulkDeletingGroupMembersSuccessful
        //         ) {
        //           groupUpdateSuccess({
        //             form,
        //             formDirective,
        //             patchState,
        //             store: this.store,
        //           });
        //         }
        //       } else {
        //         groupUpdateSuccess({
        //           form,
        //           formDirective,
        //           patchState,
        //           store: this.store,
        //         });
        //       }
        //     } else throw false;
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
        console.log('sanitized group form values => ', sanitzedValues);
        // client
        //   .mutate({
        //     mutation: mutations.CreateGroup,
        //     variables: {
        //       input: sanitzedValues,
        //     },
        //   })
        //   .then((res: any) => {
        //     const groupId = res.data?.createGroup?.id;
        //     if (groupId) {
        //       if (addMemberIds.length || removeMemberIds.length) {
        //         if (addMemberIds.length) {
        //           this.store.dispatch(
        //             new BulkCreateGroupMembers({
        //               groupId,
        //               memberIds: addMemberIds,
        //             })
        //           );
        //         }
        //         if (removeMemberIds.length) {
        //           this.store.dispatch(
        //             new BulkDeleteGroupMembers({
        //               groupId,
        //               memberIds: removeMemberIds,
        //             })
        //           );
        //         }
        //         if (
        //           this.bulkAddingGroupMembersSuccessful &&
        //           this.bulkDeletingGroupMembersSuccessful
        //         ) {
        //           groupUpdateSuccess({
        //             form,
        //             formDirective,
        //             patchState,
        //             store: this.store,
        //           });
        //         }
        //       } else {
        //         groupUpdateSuccess({
        //           form,
        //           formDirective,
        //           patchState,
        //           store: this.store,
        //         });
        //       }
        //     } else throw false;
        //   })
        //   .catch((err) => {
        //     console.error('Error while creating group', err, values);
        //     formSubmitting = false;
        //     patchState({ formSubmitting });
        //     this.store.dispatch(
        //       new ShowNotificationAction({
        //         message: 'There was an error in submitting your form!',
        //       })
        //     );
        //   });
      }
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please fill all required fields before attempting to submit!',
        })
      );
    }
  }

  @Action(DeleteGroup)
  deleteGroup({ payload }: GetGroup) {
    const { id } = payload;

    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Deleting the group...',
      })
    );
    // client
    //   .mutate({
    //     mutation: mutations.DeleteGroup,
    //     variables: {
    //       input: {
    //         id,
    //       },
    //     },
    //   })
    //   .then((res: any) => {
    //     console.log(res);
    //     this.store.dispatch(new ForceRefetchGroups());
    //     this.store.dispatch(
    //       new ToggleLoadingScreen({
    //         showLoadingScreen: false,
    //       })
    //     );
    //     this.store.dispatch(
    //       new ShowNotificationAction({
    //         message: `The group with name ${res?.data?.deleteGroup?.name} was successfully deleted`,
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
    //         message: `Something went wrong while attempting to delete the group. It may not have been deleted.`,
    //       })
    //     );
    //   });
  }
}
