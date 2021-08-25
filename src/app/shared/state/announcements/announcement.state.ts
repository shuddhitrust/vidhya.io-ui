import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultAnnouncementState,
  emptyAnnouncementFormRecord,
  AnnouncementFormCloseURL,
  AnnouncementStateModel,
} from './announcement.model';

import { Injectable } from '@angular/core';
import {
  AnnouncementSubscriptionAction,
  CreateUpdateAnnouncementAction,
  DeleteAnnouncementAction,
  FetchAnnouncementsAction,
  FetchNextAnnouncementsAction,
  ForceRefetchAnnouncementsAction,
  GetAnnouncementAction,
  ResetAnnouncementFormAction,
} from './announcement.actions';
import { ANNOUNCEMENT_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Announcement,
  MatSelectOption,
  FetchParams,
  SUBSCRIPTION_METHODS,
} from '../../common/models';
import { ANNOUNCEMENT_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  fetchParamsNewOrNot,
  subscriptionUpdater,
  updateFetchParams,
  convertPaginatedListToNormalList,
  paginatedSubscriptionUpdater,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';
import { SUBSCRIPTIONS } from '../../api/graphql/subscriptions.graphql';
import { SearchParams } from '../../abstract/master-grid/table.model';

@State<AnnouncementStateModel>({
  name: 'announcementState',
  defaults: defaultAnnouncementState,
})
@Injectable()
export class AnnouncementState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listAnnouncements(state: AnnouncementStateModel): Announcement[] {
    return state.announcements;
  }

  @Selector()
  static isFetching(state: AnnouncementStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: AnnouncementStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listAnnouncementOptions(
    state: AnnouncementStateModel
  ): MatSelectOption[] {
    const options: MatSelectOption[] = state.announcements.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.title,
      };
      return option;
    });
    console.log('options', options);
    return options;
  }

  @Selector()
  static errorFetching(state: AnnouncementStateModel): boolean {
    return state.errorFetching;
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

  @Action(ForceRefetchAnnouncementsAction)
  forceRefetchAnnouncements({
    patchState,
  }: StateContext<AnnouncementStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchAnnouncementsAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchNextAnnouncementsAction)
  fetchNextAnnouncements({ getState }: StateContext<AnnouncementStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPage;
    const previousFetchParams =
      state.fetchParamObjects[state.fetchParamObjects.length - 1];
    const pageNumber = previousFetchParams.currentPage + 1;
    const newSearchParams: SearchParams = {
      pageNumber,
      pageSize: previousFetchParams.pageSize,
      searchQuery: previousFetchParams.searchQuery,
      columnFilters: previousFetchParams.columnFilters,
    };
    if (
      !lastPageNumber ||
      (lastPageNumber != null && pageNumber <= lastPageNumber)
    ) {
      this.store.dispatch(
        new FetchAnnouncementsAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchAnnouncementsAction)
  fetchAnnouncements(
    { getState, patchState }: StateContext<AnnouncementStateModel>,
    { payload }: FetchAnnouncementsAction
  ) {
    console.log('Fetching announcements from announcement state');
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects, announcementsSubscribed } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    const variables = {
      searchField: searchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    if (fetchParamsNewOrNot({ fetchParamObjects, newFetchParams })) {
      patchState({ isFetching: true });
      console.log('variables for announcements fetch ', { variables });
      this.apollo
        .watchQuery({
          query: ANNOUNCEMENT_QUERIES.GET_ANNOUNCEMENTS,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(
          ({ data }: any) => {
            console.log('resposne to get announcements query ', { data });
            const response = data.announcements;
            const totalCount = response[0]?.totalCount
              ? response[0]?.totalCount
              : 0;
            newFetchParams = { ...newFetchParams, totalCount };
            console.log('from after getting announcements', {
              totalCount,
              response,
              newFetchParams,
            });
            let paginatedAnnouncements = state.paginatedAnnouncements;
            paginatedAnnouncements = {
              ...paginatedAnnouncements,
              [pageNumber]: response,
            };
            let announcements = convertPaginatedListToNormalList(
              paginatedAnnouncements
            );
            let lastPage = null;
            if (response.length < newFetchParams.pageSize) {
              lastPage = newFetchParams.currentPage;
            }
            patchState({
              lastPage,
              announcements,
              paginatedAnnouncements,
              fetchParamObjects: state.fetchParamObjects.concat([
                newFetchParams,
              ]),
              isFetching: false,
            });
            if (!announcementsSubscribed) {
              this.store.dispatch(new AnnouncementSubscriptionAction());
            }
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
  }

  @Action(AnnouncementSubscriptionAction)
  subscribeToAnnouncements({
    getState,
    patchState,
  }: StateContext<AnnouncementStateModel>) {
    const state = getState();
    if (!state.announcementsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.announcement,
        })
        .subscribe((result: any) => {
          const state = getState();
          console.log('announcement subscription result ', {
            announcements: state.announcements,
            result,
          });
          const method = result?.data?.notifyAnnouncement?.method;
          const announcement = result?.data?.notifyAnnouncement?.announcement;
          const { newPaginatedItems, newItemsList } =
            paginatedSubscriptionUpdater({
              paginatedItems: state.paginatedAnnouncements,
              method,
              modifiedItem: announcement,
              fetchParamObjects: state.fetchParamObjects,
            });
          patchState({
            announcements: newItemsList,
            paginatedAnnouncements: newPaginatedItems,
            announcementsSubscribed: true,
          });
        });
    }
  }

  @Action(GetAnnouncementAction)
  getAnnouncement(
    { patchState }: StateContext<AnnouncementStateModel>,
    { payload }: GetAnnouncementAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: ANNOUNCEMENT_QUERIES.GET_ANNOUNCEMENT,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.announcement;
          patchState({ announcementFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateAnnouncementAction)
  createUpdateAnnouncement(
    { getState, patchState }: StateContext<AnnouncementStateModel>,
    { payload }: CreateUpdateAnnouncementAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;
      console.log('Announcement Form values', values);
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
            ? ANNOUNCEMENT_MUTATIONS.UPDATE_ANNOUNCEMENT
            : ANNOUNCEMENT_MUTATIONS.CREATE_ANNOUNCEMENT,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm
              ? data.updateAnnouncement
              : data.createAnnouncement;
            patchState({ formSubmitting: false });
            console.log('update announcement ', { response });
            if (response.ok) {
              const method = updateForm
                ? SUBSCRIPTION_METHODS.UPDATE_METHOD
                : SUBSCRIPTION_METHODS.CREATE_METHOD;
              const announcement = response.announcement;
              const { newPaginatedItems, newItemsList } =
                paginatedSubscriptionUpdater({
                  paginatedItems: state.paginatedAnnouncements,
                  method,
                  modifiedItem: announcement,
                });

              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(AnnouncementFormCloseURL);
              patchState({
                paginatedAnnouncements: newPaginatedItems,
                announcements: newItemsList,
                announcementFormRecord: emptyAnnouncementFormRecord,
                fetchPolicy: 'network-only',
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Announcement ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
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
            console.log('From createUpdateAnnouncement', { response });
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

  @Action(DeleteAnnouncementAction)
  deleteAnnouncement(
    {}: StateContext<AnnouncementStateModel>,
    { payload }: DeleteAnnouncementAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: ANNOUNCEMENT_MUTATIONS.DELETE_ANNOUNCEMENT,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteAnnouncement;
          console.log('from delete announcement ', { data });
          if (response.ok) {
            this.router.navigateByUrl(AnnouncementFormCloseURL);
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Announcement deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchAnnouncementsAction({
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

  @Action(ResetAnnouncementFormAction)
  resetAnnouncementForm({ patchState }: StateContext<AnnouncementStateModel>) {
    patchState({
      announcementFormRecord: emptyAnnouncementFormRecord,
      formSubmitting: false,
    });
  }
}
