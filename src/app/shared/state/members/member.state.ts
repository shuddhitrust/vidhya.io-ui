import {
  State,
  Action,
  Selector,
  Store,
  StateContext,
  Select,
} from '@ngxs/store';
import {
  defaultMemberState,
  emptyMemberFormRecord,
  MemberStateModel,
} from './member.model';
import {
  CreateUpdateMember,
  DeleteMember,
  FetchMemberOptionsByInstitution,
  FetchMembers,
  ForceRefetchMembers,
  GetMember,
  ResetMemberForm,
  SetMemberFormRecord,
} from './member.actions';
import { Injectable } from '@angular/core';
import { ShowNotificationAction } from '../notifications/notification.actions';
import { ToggleLoadingScreen } from '../loading/loading.actions';
import { MatSelectOption, PaginationObject, User } from '../../common/models';
import {
  getOptionLabel,
  setNextToken,
  updatePaginationObject,
} from './../../common/functions';
import { defaultPageSize } from '../../abstract/master-grid/table.model';
import { Observable } from 'rxjs';
import { AuthState } from '../auth/auth.state';
import { Router } from '@angular/router';
import { group } from '@angular/animations';
import { CreateGroupMember } from '../groupMembers/group-members.actions';
import { GroupMemberState } from '../groupMembers/group-members.state';

@State<MemberStateModel>({
  name: 'memberState',
  defaults: defaultMemberState,
})
@Injectable()
export class MemberState {
  // @Select(AuthState.getIsFullyAuthenticated)
  // isFullyAuthenticated$: Observable<boolean>;
  // isFullyAuthenticated: boolean;
  // @Select(GroupMemberState.getCreateGroupMemberResponse)
  // createGroupMemberResponse$: Observable<any>;
  // createGroupMemberResponse: any;
  constructor(private store: Store, private router: Router) {
    // this.isFullyAuthenticated$.subscribe((val) => {
    //   this.isFullyAuthenticated = val;
    // });
    // this.createGroupMemberResponse$.subscribe((val) => {
    //   console.log('successfully added group member ', val);
    //   this.createGroupMemberResponse = val;
    // });
  }

  @Selector()
  static listMembers(state: MemberStateModel): User[] {
    return state.members;
  }

  @Selector()
  static isFetchingFormRecord(state: MemberStateModel) {
    return state.isFetchingFormRecord;
  }

  @Selector()
  static memberFormRecord(state: MemberStateModel) {
    return state.memberFormRecord;
  }

  @Selector()
  static paginationObject(state: MemberStateModel): PaginationObject {
    return state.paginationObject;
  }

  @Selector()
  static listMemberOptions(state: MemberStateModel): MatSelectOption[] {
    return state.members.map((m) => {
      return { value: m.id, label: m.name };
    });
  }

  @Selector()
  static isFetching(state: MemberStateModel): boolean {
    return state.isFetching;
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

  @Action(FetchMemberOptionsByInstitution)
  fetchMembersByInstitution(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: FetchMemberOptionsByInstitution
  ) {
    const { memberInstitutionId } = payload;
  }

  @Action(ForceRefetchMembers)
  fetchMembersFromNetwork(
    { patchState }: StateContext<MemberStateModel>,
    { payload }: ForceRefetchMembers
  ) {
    const { searchParams } = payload;
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(new FetchMembers({ searchParams }));
  }

  @Action(FetchMembers)
  fetchMembers(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: FetchMembers
  ) {
    const { searchParams } = payload;
    console.log('search params from members state ', searchParams);
    const state = getState();
    let { members, isFetching, errorFetching, fetchPolicy, paginationObject } =
      state;
    isFetching = true;
    errorFetching = false;
    patchState({ isFetching, errorFetching, members });

    // Constructing the filter object
    let filter = {
      ...searchParams?.columnFilters,
    };

    // Constructing the searchField if any
    const searchField = searchParams?.searchQuery
      ? { contains: searchParams.searchQuery.toLowerCase() }
      : null;

    // If searchField is valid, we add it to the filter
    if (searchField) {
      filter = { ...filter, searchField };
    }
    // If the
    filter = Object.keys(filter).length ? filter : null;
    console.log('listMembers filter', { filter });
    /* updating the paginationObject with the incoming new page number
    This is necessary for setting the right token
    */
    paginationObject = {
      ...paginationObject,
      pageIndex: searchParams?.pageNumber
        ? searchParams?.pageNumber
        : paginationObject.pageIndex,
    };
    // Constructing the variables to be used in the Graphql Query
    const variables = {
      filter,
      limit: searchParams?.pageSize ? searchParams?.pageSize : defaultPageSize,
      // limit: 1,
      nextToken: setNextToken(paginationObject),
    };
    console.log('variables for the query => ', variables);
    // client
    //   .query({
    //     query: queries.ListMembers,
    //     variables,
    //     fetchPolicy: fetchPolicy,
    //   })
    //   .then((res: any) => {
    //     console.log('Fetch members response => ', res);
    //     isFetching = false;
    //     const members = res.data.listMembers.items;
    //     const returnedNextToken = res.data.listMembers.nextToken;
    //     fetchPolicy = null;
    //     paginationObject = updatePaginationObject(
    //       paginationObject,
    //       returnedNextToken
    //     );
    //     patchState({ members, isFetching, fetchPolicy, paginationObject });
    //   })
    //   .catch((err) => {
    //     isFetching = false;
    //     errorFetching = true;
    //     members = [];
    //     patchState({ members, isFetching, errorFetching });
    //   });
  }

  @Action(ResetMemberForm)
  resetMemberForm({ getState, patchState }: StateContext<MemberStateModel>) {
    patchState({ memberFormRecord: emptyMemberFormRecord });
  }

  @Action(GetMember)
  getMember(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: GetMember
  ) {
    const { id } = payload;
    const state = getState();
    const memberFound = state.members.find((i) => i.id == id);
    if (memberFound) {
      patchState({ memberFormRecord: memberFound });
    } else {
      patchState({ isFetchingFormRecord: true });
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Fetching the member...',
        })
      );
      // client
      //   .query({
      //     query: queries.GetMember,
      //     variables: {
      //       id,
      //     },
      //   })
      //   .then((res: any) => {
      //     this.store.dispatch(
      //       new ToggleLoadingScreen({ showLoadingScreen: false })
      //     );
      //     const memberFormRecord = res.data.getMember;
      //     patchState({ memberFormRecord, isFetchingFormRecord: false });
      //   })
      //   .catch((res: any) => {
      //     console.error(res);
      //     this.store.dispatch(
      //       new ToggleLoadingScreen({ showLoadingScreen: false })
      //     );
      //     this.store.dispatch(
      //       new ShowNotificationAction({
      //         message:
      //           'There was an error in fetching the member! Try again later.',
      //       })
      //     );
      //     patchState({
      //       memberFormRecord: emptyMemberFormRecord,
      //       isFetchingFormRecord: false,
      //     });
      //   });
    }
  }

  @Action(SetMemberFormRecord)
  setMemberFormRecord(
    { patchState }: StateContext<MemberStateModel>,
    { payload }: SetMemberFormRecord
  ) {
    patchState({ memberFormRecord: payload });
  }

  @Action(CreateUpdateMember)
  createUpdateMember(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: CreateUpdateMember
  ) {
    const state = getState();
    const { form, formDirective, institutionOptions } = payload;
    let { formSubmitting } = state;
    function memberSuccessfullyAdded({
      store,
      form,
      formDirective,
      sanitizedValues,
      router,
    }) {
      formSubmitting = false;
      form.reset();
      formDirective.resetForm();
      patchState({
        memberFormRecord: emptyMemberFormRecord,
        formSubmitting,
        fetchPolicy: 'network-only',
      });
      // this.store.dispatch(new ForceRefetchMembers({}));
      store.dispatch(
        new ShowNotificationAction({
          message: `Registration Successful! Welcome ${sanitizedValues.name}! `,
        })
      );
      console.log('reloading and then redirecting to home page');
      // location.reload();
      router.navigate(['/']);
      // store.dispatch(new GetCurrentMember());
      console.log('redirected to home page');
    }
    // if (form.valid) {
    //   formSubmitting = true;
    //   const values = form.value;
    //   const { groups, ...sanitizedValues } = values;
    //   const updateForm = sanitizedValues.id ? true : false;
    //   patchState({ formSubmitting });
    //   console.log('member form values => ', sanitizedValues);
    //   if (updateForm && this.isFullyAuthenticated) {
    //     // client
    //     //   .mutate({
    //     //     mutation: mutations.UpdateMember,
    //     //     variables: {
    //     //       input: sanitizedValues,
    //     //     },
    //     //   })
    //     //   .then((res: any) => {
    //     //     formSubmitting = false;
    //     //     form.reset();
    //     //     formDirective.resetForm();
    //     //     patchState({
    //     //       memberFormRecord: emptyMemberFormRecord,
    //     //       formSubmitting,
    //     //     });
    //     //     this.store.dispatch(new ForceRefetchMembers({}));
    //     //     this.store.dispatch(
    //     //       new ShowNotificationAction({
    //     //         message: 'Form submitted successfully!',
    //     //       })
    //     //     );
    //     //   })
    //     //   .catch((err) => {
    //     //     console.error(err);
    //     //     formSubmitting = false;
    //     //     patchState({ formSubmitting });
    //     //     this.store.dispatch(
    //     //       new ShowNotificationAction({
    //     //         message: 'There was an error in submitting your form!',
    //     //       })
    //     //     );
    //     //   });
    //   } else if (!this.isFullyAuthenticated) {
    //     // Create method for member
    //     // sanitizedValues.title = constructMemberTitle(
    //     //   sanitizedValues,
    //     //   institutionOptions
    //     // );
    //     sanitizedValues.bio = sanitizedValues.bio
    //       ? sanitizedValues.bio
    //       : "I'm new at Shuddhi Vidhya!";
    //     console.log('Creating member ', { groups, sanitizedValues });
    //     // client
    //     //   .mutate({
    //     //     mutation: mutations.CreateMember,
    //     //     variables: {
    //     //       input: sanitizedValues,
    //     //     },
    //     //   })
    //     //   .then((res: any) => {
    //     //     // if (res?.User?.Attributes[0]?.sub) {
    //     //     // executing the following only when we receive the created user's ID in the response

    //     //     if (groups) {
    //     //       console.log('Member is being created with groups', groups);
    //     //       this.store.dispatch(
    //     //         new CreateGroupMember({
    //     //           groupId: groups,
    //     //           memberId: sanitizedValues.id,
    //     //         })
    //     //       );
    //     //       this.createGroupMemberResponse$.subscribe((response) => {
    //     //         if (response?.id) {
    //     //           memberSuccessfullyAdded({
    //     //             store: this.store,
    //     //             router: this.router,
    //     //             form,
    //     //             formDirective,
    //     //             sanitizedValues,
    //     //           });
    //     //         }
    //     //       });
    //     //     } else {
    //     //       memberSuccessfullyAdded({
    //     //         store: this.store,
    //     //         router: this.router,
    //     //         form,
    //     //         formDirective,
    //     //         sanitizedValues,
    //     //       });
    //     //     }
    //     //   })
    //     //   .catch((err) => {
    //     //     console.error('Error while creating member', err);
    //     //     formSubmitting = false;
    //     //     patchState({ formSubmitting });
    //     //     this.store.dispatch(
    //     //       new ShowNotificationAction({
    //     //         message: 'There was an error in submitting your form!',
    //     //       })
    //     //     );
    //     //   });
    //   }
    // } else {
    //   this.store.dispatch(
    //     new ShowNotificationAction({
    //       message:
    //         'Please fill all required fields before attempting to submit!',
    //     })
    //   );
    // }
  }

  @Action(DeleteMember)
  deleteMember(
    { getState, patchState }: StateContext<MemberStateModel>,
    { payload }: DeleteMember
  ) {
    console.log('From delete member action in state => ', payload);
    const { id } = payload;

    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Deleting the member...',
      })
    );
    // client
    //   .mutate({
    //     mutation: mutations.DeleteMember,
    //     variables: {
    //       input: {
    //         id,
    //       },
    //     },
    //   })
    //   .then((res: any) => {
    //     console.log(res);
    //     this.store.dispatch(
    //       new ToggleLoadingScreen({
    //         showLoadingScreen: false,
    //       })
    //     );
    //     this.store.dispatch(
    //       new ShowNotificationAction({
    //         message: `The member with name ${res?.data?.deleteMember?.name} was successfully deleted`,
    //       })
    //     );
    //     this.store.dispatch(new ForceRefetchMembers({}));
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
    //         message: `Something went wrong while attempting to delete the member. It may not have been deleted.`,
    //       })
    //     );
    //   });
  }
}

// const constructMemberTitle = (
//   values,
//   institutionOptions: MatSelectOption[]
// ): string => {
//   if (values.title) {
//     return values.title;
//   } else {
//     const institutionLabel = getOptionLabel(
//       values.memberInstitutionId,
//       institutionOptions
//     );
//     switch (values.type) {
//       case CognitoGroup.SUPER_ADMIN || CognitoGroup.INSTITUTION_ADMIN:
//         return `Administrator at ${institutionLabel}`;
//       case CognitoGroup.CLASS_ADMIN:
//         return `Class admin at ${institutionLabel}`;
//       case CognitoGroup.LEARNER:
//         return `Learner from ${institutionLabel}`;
//       case CognitoGroup.INSTRUCTOR:
//         return `Instructor at ${institutionLabel}`;
//       default:
//         return `Member of ${institutionLabel}`;
//     }
//   }
// };
