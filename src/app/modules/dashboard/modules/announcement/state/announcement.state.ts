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
import { ANNOUNCEMENT_QUERIES } from '../../../../../shared/api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Announcement,
  MatSelectOption,
  FetchParams,
  SUBSCRIPTION_METHODS,
  startingFetchParams,
} from '../../../../../shared/common/models';
import { ANNOUNCEMENT_MUTATIONS } from '../../../../../shared/api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../../../../../shared/state/notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  subscriptionUpdater,
  updateFetchParams,
  convertPaginatedListToNormalList,
  paginatedSubscriptionUpdater,
} from '../../../../../shared/common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../../../../shared/common/constants';
import { SUBSCRIPTIONS } from '../../../../../shared/api/graphql/subscriptions.graphql';
import { SearchParams } from '../../../../../shared/modules/master-grid/table.model';
import { ToggleLoadingScreen } from '../../../../../shared/state/loading/loading.actions';

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
    getState,
    patchState,
  }: StateContext<AnnouncementStateModel>) {
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
      new FetchAnnouncementsAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchNextAnnouncementsAction)
  fetchNextAnnouncements({ getState }: StateContext<AnnouncementStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPage;
    let previousFetchParams =
      state.fetchParamObjects[state.fetchParamObjects.length - 1];
    previousFetchParams = previousFetchParams
      ? previousFetchParams
      : startingFetchParams;
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
    let { searchParams } = payload;
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
    const variables = {
      searchField: searchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    patchState({ isFetching: true });
    this.store.dispatch(
      new ToggleLoadingScreen({
        message: 'Fetching announcements...',
        showLoadingScreen: true,
      })
    );
    this.apollo
      .watchQuery({
        query: ANNOUNCEMENT_QUERIES.GET_ANNOUNCEMENTS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
            })
          );
          const response = data.announcements;
          newFetchParams = { ...newFetchParams };
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
          const method = result?.data?.notifyAnnouncement?.method;
          const announcement = result?.data?.notifyAnnouncement?.announcement;
          const { newPaginatedItems, newItemsList } =
            paginatedSubscriptionUpdater({
              paginatedItems: state.paginatedAnnouncements,
              method,
              modifiedItem: announcement,
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
          patchState({
            announcementFormRecord: response,
            isFetching: false,
            fetchPolicy: 'network-only',
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

  @Action(DeleteAnnouncementAction)
  deleteAnnouncement(
    { getState, patchState }: StateContext<AnnouncementStateModel>,
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

          if (response.ok) {
            this.router.navigateByUrl(AnnouncementFormCloseURL);
            const method = SUBSCRIPTION_METHODS.DELETE_METHOD;
            const announcement = response.announcement;
            const state = getState();
            const { newPaginatedItems, newItemsList } =
              paginatedSubscriptionUpdater({
                paginatedItems: state.paginatedAnnouncements,
                method,
                modifiedItem: announcement,
              });
            patchState({
              paginatedAnnouncements: newPaginatedItems,
              announcements: newItemsList,
              announcementFormRecord: emptyAnnouncementFormRecord,
            });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Announcement deleted successfully!',
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

  @Action(ResetAnnouncementFormAction)
  resetAnnouncementForm({ patchState }: StateContext<AnnouncementStateModel>) {
    patchState({
      announcementFormRecord: emptyAnnouncementFormRecord,
      formSubmitting: false,
    });
  }
}
