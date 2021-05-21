import { State, Action, Selector, Store, StateContext } from '@ngxs/store';
import {
  defaultAnnouncementState,
  emptyAnnouncementFormRecord,
  AnnouncementStateModel,
} from './announcement.model';
import {
  CreateUpdateAnnouncement,
  DeleteAnnouncement,
  FetchAnnouncements,
  ForceRefetchAnnouncements,
  GetAnnouncement,
} from './announcement.actions';
import { Injectable } from '@angular/core';
import { ShowNotificationAction } from '../notifications/notification.actions';
import { ToggleLoadingScreen } from '../loading/loading.actions';
import { Announcement, MatSelectOption } from '../../common/models';
import { setNextToken, updatePaginationObject } from '../../common/functions';
import { defaultPageSize } from '../../abstract/master-grid/table.model';
import { ForceRefetchInstitutions } from '../institutions/institution.actions';

@State<AnnouncementStateModel>({
  name: 'announcementState',
  defaults: defaultAnnouncementState,
})
@Injectable()
export class AnnouncementState {
  constructor(private store: Store) {}

  @Selector()
  static listAnnouncements(state: AnnouncementStateModel): Announcement[] {
    return state.announcements;
  }

  @Selector()
  static paginationObject(state: AnnouncementStateModel): Object {
    return state.paginationObject;
  }

  @Selector()
  static listAnnouncementOptions(
    state: AnnouncementStateModel
  ): MatSelectOption[] {
    return state.announcements.map((m) => {
      return { value: m.id, label: m.title };
    });
  }

  @Selector()
  static isFetching(state: AnnouncementStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static errorFetching(state: AnnouncementStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static isFetchingFormRecord(state: AnnouncementStateModel) {
    return state.isFetchingFormRecord;
  }

  @Selector()
  static announcementFormRecord(state: AnnouncementStateModel) {
    return state.announcementFormRecord;
  }

  @Selector()
  static formSubmitting(state: AnnouncementStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: AnnouncementStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getAnnouncementFormRecord(
    state: AnnouncementStateModel
  ): Announcement {
    return state.announcementFormRecord;
  }

  @Action(ForceRefetchAnnouncements)
  fetchAnnouncementsFromNetwork(
    { patchState }: StateContext<AnnouncementStateModel>,
    { payload }: ForceRefetchInstitutions
  ) {
    const { searchParams } = payload;
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(new FetchAnnouncements({ searchParams }));
  }

  @Action(FetchAnnouncements)
  fetchAnnouncements(
    { getState, patchState }: StateContext<AnnouncementStateModel>,
    { payload }: FetchAnnouncements
  ) {
    const { searchParams } = payload;
    console.log('search params from announcements state ', searchParams);
    const state = getState();
    let {
      announcements,
      isFetching,
      errorFetching,
      fetchPolicy,
      paginationObject,
    } = state;
    isFetching = true;
    errorFetching = false;
    patchState({ isFetching, errorFetching, announcements });

    // Constructing the filter object
    let filter = {
      ...searchParams?.columnFilters,
      searchField: searchParams?.searchQuery
        ? { contains: searchParams?.searchQuery.toLowerCase() }
        : null,
    };

    filter = Object.keys(filter).length ? filter : null;
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
    //     query: queries.ListAnnouncements,
    //     fetchPolicy: fetchPolicy,
    //   })
    //   .then((res: any) => {
    //     console.log('Getting announcement response => ', res);
    //     isFetching = false;
    //     const announcements = res.data.listAnnouncements.items;
    //     const returnedNextToken = res.data.listAnnouncements.nextToken;
    //     fetchPolicy = null;
    //     paginationObject = updatePaginationObject(
    //       paginationObject,
    //       returnedNextToken
    //     );
    //     patchState({
    //       announcements,
    //       isFetching,
    //       fetchPolicy,
    //       paginationObject,
    //     });
    //   })
    //   .catch((err) => {
    //     console.error('Error in announcement fetch => ', err);
    //     isFetching = false;
    //     errorFetching = true;
    //     announcements = [];
    //     patchState({ announcements, isFetching, errorFetching });
    //   });
  }

  @Action(GetAnnouncement)
  getAnnouncement(
    { getState, patchState }: StateContext<AnnouncementStateModel>,
    { payload }: GetAnnouncement
  ) {
    const { id } = payload;
    const state = getState();
    const announcementFound = state.announcements.find((i) => i.id == id);
    if (announcementFound) {
      patchState({ announcementFormRecord: announcementFound });
    } else {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Fetching the announcement...',
        })
      );
      // client
      //   .query({
      //     query: queries.GetAnnouncement,
      //     variables: {
      //       id,
      //     },
      //   })
      //   .then((res: any) => {
      //     this.store.dispatch(
      //       new ToggleLoadingScreen({ showLoadingScreen: false })
      //     );
      //     const announcementFormRecord = res.data.getAnnouncement;
      //     patchState({ announcementFormRecord });
      //   })
      //   .catch((res: any) => {
      //     console.error(res);
      //     this.store.dispatch(
      //       new ToggleLoadingScreen({ showLoadingScreen: false })
      //     );
      //     this.store.dispatch(
      //       new ShowNotificationAction({
      //         message:
      //           'There was an error in fetching the announcement! Try again later.',
      //       })
      //     );
      //   });
    }
  }

  @Action(CreateUpdateAnnouncement)
  createUpdateAnnouncement(
    { getState, patchState }: StateContext<AnnouncementStateModel>,
    { payload }: CreateUpdateAnnouncement
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      const values = form.value;
      const updateForm = values.id ? true : false;
      patchState({ formSubmitting });
      if (updateForm) {
        // client
        //   .mutate({
        //     mutation: updateForm
        //       ? mutations.UpdateAnnouncement
        //       : mutations.CreateAnnouncement,
        //     variables: {
        //       input: values,
        //     },
        //   })
        //   .then((res: any) => {
        //     formSubmitting = false;
        //     form.reset();
        //     formDirective.resetForm();
        //     patchState({
        //       announcementFormRecord: emptyAnnouncementFormRecord,
        //       formSubmitting,
        //     });
        //     this.store.dispatch(new ForceRefetchAnnouncements({}));
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
        // Create method for announcement
        console.log('sending values to createAnnouncement => ', values);
        // client
        //   .mutate({
        //     mutation: mutations.CreateAnnouncement,
        //     variables: { input: values },
        //   })
        //   .then((res: any) => {
        //     formSubmitting = false;
        //     form.reset();
        //     formDirective.resetForm();
        //     patchState({
        //       announcementFormRecord: emptyAnnouncementFormRecord,
        //       formSubmitting,
        //     });
        //     this.store.dispatch(new ForceRefetchAnnouncements({}));
        //     this.store.dispatch(
        //       new ShowNotificationAction({
        //         message: 'Form submitted successfully!',
        //       })
        //     );
        //   })
        //   .catch((err) => {
        //     console.error('Error while creating announcement', err);
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
            'Please make sure there are no errors in the form before attempting to submit!',
        })
      );
    }
  }

  @Action(DeleteAnnouncement)
  deleteAnnouncement(
    { getState, patchState }: StateContext<AnnouncementStateModel>,
    { payload }: DeleteAnnouncement
  ) {
    console.log('delete announcment payloa d => ', payload);
    const { id } = payload;

    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Deleting the announcement...',
      })
    );
    // client
    //   .mutate({
    //     mutation: mutations.DeleteAnnouncement,
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
    //         message: `The announcement with name ${res?.data?.deleteAnnouncement?.title} was successfully deleted!`,
    //       })
    //     );
    //     this.store.dispatch(new ForceRefetchAnnouncements({}));
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
    //         message: `Something went wrong while attempting to delete the announcement. It may not have been deleted.`,
    //       })
    //     );
    //   });
  }
}
