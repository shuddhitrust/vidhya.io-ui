import { Action, Selector, State, StateContext, Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { PUBLIC_QUERIES } from '../../../../shared/api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';

import {
  columnFiltersChanged,
  convertPaginatedListToNormalList,
  getErrorMessageFromGraphQLResponse,
  paginatedSubscriptionUpdater,
  updateFetchParams,
} from 'src/app/shared/common/functions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import {
  Announcement,
  Institution,
  PublicCourse,
  startingFetchParams,
  User,
} from 'src/app/shared/common/models';
import { defaultPublicState, PublicStateModel } from './public.model';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import {
  FetchNewsAction,
  FetchNextNewsAction,
  FetchNextPublicCoursesAction,
  FetchNextPublicInstitutionsAction,
  FetchNextPublicMembersAction,
  FetchPublicCoursesAction,
  FetchPublicInstitutionssAction,
  FetchPublicMembersAction,
  ForceRefetchNewsAction,
  GetMemberByUsernameAction,
  GetNewsAction,
  GetPublicInstitutionAction,
  ResetNewsProfileAction,
  ResetPublicHomePageListsAction,
  ResetPublicInstitutionFormAction,
  ResetPublicMemberFormAction,
} from './public.actions';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { SUBSCRIPTIONS } from 'src/app/shared/api/graphql/subscriptions.graphql';
import { AnnouncementSubscriptionAction } from 'src/app/modules/dashboard/modules/announcement/state/announcement.actions';

@State<PublicStateModel>({
  name: 'publicState',
  defaults: defaultPublicState,
})
@Injectable()
export class PublicState {
  constructor(private apollo: Apollo, private store: Store) {}

  @Selector()
  static getMemberFormRecord(state: PublicStateModel): User {
    return state.memberFormRecord;
  }

  @Selector()
  static getInstitutionFormRecord(state: PublicStateModel): Institution {
    return state.institutionFormRecord;
  }

  @Selector()
  static listInstitutions(state: PublicStateModel): Institution[] {
    return state.institutions;
  }

  @Selector()
  static listMembers(state: PublicStateModel): User[] {
    return state.members;
  }

  @Selector()
  static isFetchingMembers(state: PublicStateModel): boolean {
    return state.isFetchingMembers;
  }

  @Selector()
  static isFetchingInstitutions(state: PublicStateModel): boolean {
    return state.isFetchingInstitutions;
  }

  @Selector()
  static isFetchingFormRecord(state: PublicStateModel): boolean {
    return state.isFetchingFormRecord;
  }

  @Selector()
  static listNews(state: PublicStateModel): Announcement[] {
    return state.news;
  }

  @Selector()
  static isFetchingNews(state: PublicStateModel): boolean {
    return state.isFetchingNews;
  }

  @Selector()
  static getNewsRecord(state: PublicStateModel): PublicCourse {
    return state.courseRecord;
  }

  @Selector()
  static listPublicCourses(state: PublicStateModel): PublicCourse[] {
    return state.courses;
  }

  @Selector()
  static isFetchingPublicCourses(state: PublicStateModel): boolean {
    return state.isFetchingCourses;
  }

  @Selector()
  static getPublicCourseRecord(state: PublicStateModel): PublicCourse {
    return state.courseRecord;
  }

  @Action(FetchNextPublicMembersAction)
  fetchNextPublicMembers({ getState }: StateContext<PublicStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPagePublicMembers;
    let previousFetchParams =
      state.fetchMembersParamObjects[state.fetchMembersParamObjects.length - 1];
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
        new FetchPublicMembersAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchPublicMembersAction)
  fetchPublicMembers(
    { getState, patchState }: StateContext<PublicStateModel>,
    { payload }: FetchPublicMembersAction
  ) {
    let state = getState();
    const { searchParams } = payload;
    const { fetchMembersParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects: fetchMembersParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    if (
      columnFiltersChanged({
        fetchParamObjects: fetchMembersParamObjects,
        newFetchParams,
      })
    ) {
      patchState({
        members: defaultPublicState.members,
        paginatedPublicMembers: defaultPublicState.paginatedPublicMembers,
        lastPagePublicMembers: defaultPublicState.lastPagePublicMembers,
      });
    }
    patchState({ isFetchingMembers: true });
    const variables = {
      searchField: searchQuery,
      membershipStatusNot: columnFilters.membershipStatusNot,
      membershipStatusIs: columnFilters.membershipStatusIs,
      roles: columnFilters.roles,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };

    this.apollo
      .watchQuery({
        query: PUBLIC_QUERIES.GET_PUBLIC_USERS,
        variables,
        fetchPolicy: 'cache-first',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          state = getState();
          const response = data.publicUsers.records;
          newFetchParams = { ...newFetchParams };
          let paginatedPublicMembers = state.paginatedPublicMembers;
          paginatedPublicMembers = {
            ...paginatedPublicMembers,
            [pageNumber]: response,
          };
          let members = convertPaginatedListToNormalList(
            paginatedPublicMembers
          );
          let lastPagePublicMembers = null;
          if (response.length < newFetchParams.pageSize) {
            lastPagePublicMembers = newFetchParams.currentPage;
          }
          patchState({
            members,
            paginatedPublicMembers,
            lastPagePublicMembers,
            fetchMembersParamObjects: state.fetchMembersParamObjects.concat([
              newFetchParams,
            ]),
            isFetchingMembers: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingMembers: false });
        }
      );
  }

  @Action(GetMemberByUsernameAction)
  getMemberByUsername(
    { patchState }: StateContext<PublicStateModel>,
    { payload }: GetMemberByUsernameAction
  ) {
    const { username } = payload;
    patchState({ isFetchingFormRecord: true });
    this.apollo
      .watchQuery({
        query: PUBLIC_QUERIES.GET_USER_BY_USERNAME,
        variables: { username },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.userByUsername;
          patchState({
            memberFormRecord: response,
            isFetchingFormRecord: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingFormRecord: false });
        }
      );
  }

  @Action(ResetPublicMemberFormAction)
  resetPublicMemberFormAction({ patchState }: StateContext<PublicStateModel>) {
    patchState({
      isFetchingFormRecord: false,
      memberFormRecord: defaultPublicState.memberFormRecord,
    });
  }

  @Action(FetchNextPublicInstitutionsAction)
  fetchNextPublicInstitutions({ getState }: StateContext<PublicStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPagePublicInstitutions;
    let previousFetchParams =
      state.fetchInstitutionsParamObjects[
        state.fetchInstitutionsParamObjects.length - 1
      ];
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
        new FetchPublicInstitutionssAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchPublicInstitutionssAction)
  fetchPublicInstitutions(
    { getState, patchState }: StateContext<PublicStateModel>,
    { payload }: FetchPublicInstitutionssAction
  ) {
    let state = getState();
    const { searchParams } = payload;
    const { fetchPolicy, fetchInstitutionsParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects: fetchInstitutionsParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    if (
      columnFiltersChanged({
        fetchParamObjects: fetchInstitutionsParamObjects,
        newFetchParams,
      })
    ) {
      patchState({
        institutions: defaultPublicState.institutions,
        paginatedPublicInstitutions:
          defaultPublicState.paginatedPublicInstitutions,
        lastPagePublicInstitutions:
          defaultPublicState.lastPagePublicInstitutions,
      });
    }
    patchState({ isFetchingInstitutions: true });
    const variables = {
      searchField: searchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };

    this.apollo
      .watchQuery({
        query: PUBLIC_QUERIES.GET_PUBLIC_INSTITUTIONS,
        variables,
        fetchPolicy: 'cache-first',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          state = getState();
          const response = data.publicInstitutions.records;
          newFetchParams = { ...newFetchParams };
          let paginatedPublicInstitutions = state.paginatedPublicInstitutions;
          paginatedPublicInstitutions = {
            ...paginatedPublicInstitutions,
            [pageNumber]: response,
          };
          let institutions = convertPaginatedListToNormalList(
            paginatedPublicInstitutions
          );
          let lastPagePublicInstitutions = null;
          if (response.length < newFetchParams.pageSize) {
            lastPagePublicInstitutions = newFetchParams.currentPage;
          }
          patchState({
            institutions,
            paginatedPublicInstitutions,
            lastPagePublicInstitutions,
            fetchInstitutionsParamObjects:
              state.fetchInstitutionsParamObjects.concat([newFetchParams]),
            isFetchingInstitutions: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingInstitutions: false });
        }
      );
  }

  @Action(GetPublicInstitutionAction)
  getPublicInstitution(
    { patchState }: StateContext<PublicStateModel>,
    { payload }: GetPublicInstitutionAction
  ) {
    const { code } = payload;
    patchState({ isFetchingFormRecord: true });
    this.apollo
      .watchQuery({
        query: PUBLIC_QUERIES.GET_PUBLIC_INSTITUTION,
        variables: { code },
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.publicInstitution;
          patchState({
            institutionFormRecord: response,
            isFetchingFormRecord: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingFormRecord: false });
        }
      );
  }

  @Action(ForceRefetchNewsAction)
  forceRefetchNews({
    getState,
    patchState,
  }: StateContext<PublicStateModel>) {
    const state = getState();
    let previousFetchParams =
      state.fetchParamNewsObjects[state.fetchParamNewsObjects.length - 1];
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
      new FetchNewsAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchNextNewsAction)
  fetchNextNews({ getState }: StateContext<PublicStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastNewsPage;
    let previousFetchParams =
      state.fetchParamNewsObjects[state.fetchParamNewsObjects.length - 1];
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
        new FetchNewsAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchNewsAction)
  fetchNews(
    { getState, patchState }: StateContext<PublicStateModel>,
    { payload }: FetchNewsAction
  ) {
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamNewsObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects: fetchParamNewsObjects,
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
    patchState({ isFetchingNews: true });
    this.store.dispatch(
      new ToggleLoadingScreen({
        message: 'Fetching news...',
        showLoadingScreen: true,
      })
    );
    this.apollo
      .watchQuery({
        query: PUBLIC_QUERIES.GET_PUBLIC_NEWS,
        variables,
        fetchPolicy: 'cache-first',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
            })
          );
          const response = data.publicAnnouncements;
          newFetchParams = { ...newFetchParams };
          let paginatedNews = state.paginatedNews;
          paginatedNews = {
            ...paginatedNews,
            [pageNumber]: response,
          };
          let news = convertPaginatedListToNormalList(paginatedNews);
          let lastNewsPage = null;
          if (response.length < newFetchParams.pageSize) {
            lastNewsPage = newFetchParams.currentPage;
          }
          patchState({
            lastNewsPage,
            news,
            paginatedNews,
            fetchParamNewsObjects: state.fetchParamNewsObjects.concat([newFetchParams]),
            isFetchingNews: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingNews: false });
        }
      );
  }

  @Action(AnnouncementSubscriptionAction)
  subscribeToAnnouncements({
    getState,
    patchState,
  }: StateContext<PublicStateModel>) {
    const state = getState();
    console.log('Announcement subscription started...');
    if (!state.newsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.announcement,
        })
        .subscribe((result: any) => {
          const response = result?.data?.notifyAnnouncement;
          if (response) {
            console.log('received a new result => ', { result });
            const state = getState();
            const method = response.method;
            const announcement = result?.data?.notifyAnnouncement?.announcement;
            const { newPaginatedItems, newItemsList } =
              paginatedSubscriptionUpdater({
                paginatedItems: state.paginatedNews,
                method,
                modifiedItem: announcement,
              });
            patchState({
              news: newItemsList,
              paginatedNews: newPaginatedItems,
              newsSubscribed: true,
            });
          }
        });
    }
  }

  @Action(GetNewsAction)
  getPublicAnnouncement(
    { patchState }: StateContext<PublicStateModel>,
    { payload }: GetNewsAction
  ) {
    const { id } = payload;
    patchState({ isFetchingNews: true });
    const query = PUBLIC_QUERIES.GET_PUBLIC_NEWS_ITEM;
    console.log('Making request for public news item ');
    this.apollo
      .watchQuery({
        query,
        variables: { id },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.publicAnnouncement;
          patchState({
            newsRecord: response,
            isFetchingNews: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingNews: false });
        }
      );
  }

  @Action(ResetNewsProfileAction)
  resetPublicNewsProfileAction({ patchState }: StateContext<PublicStateModel>) {
    patchState({
      isFetchingNews: false,
      newsRecord: defaultPublicState.newsRecord,
    });
  }

  @Action(FetchNextPublicCoursesAction)
  fetchNextPublicCourses({ getState }: StateContext<PublicStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPagePublicMembers;
    let previousFetchParams =
      state.fetchMembersParamObjects[state.fetchMembersParamObjects.length - 1];
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
        new FetchPublicCoursesAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchPublicCoursesAction)
  fetchPublicCourses(
    { getState, patchState }: StateContext<PublicStateModel>,
    { payload }: FetchPublicMembersAction
  ) {
    let state = getState();
    const { searchParams } = payload;
    const { fetchCoursesParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects: fetchCoursesParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    if (
      columnFiltersChanged({
        fetchParamObjects: fetchCoursesParamObjects,
        newFetchParams,
      })
    ) {
      patchState({
        courses: defaultPublicState.courses,
        paginatedPublicCourses: defaultPublicState.paginatedPublicCourses,
        lastPagePublicCourses: defaultPublicState.lastPagePublicCourses,
      });
    }
    patchState({ isFetchingCourses: true });
    const variables = {
      searchField: searchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };

    this.apollo
      .watchQuery({
        query: PUBLIC_QUERIES.GET_PUBLIC_COURSES,
        variables,
        fetchPolicy: 'cache-first',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          state = getState();
          const response = data.publicCourses.records;
          newFetchParams = { ...newFetchParams };
          let paginatedPublicCourses = state.paginatedPublicCourses;
          paginatedPublicCourses = {
            ...paginatedPublicCourses,
            [pageNumber]: response,
          };
          let courses = convertPaginatedListToNormalList(
            paginatedPublicCourses
          );
          let lastPagePublicCourses = null;
          if (response.length < newFetchParams.pageSize) {
            lastPagePublicCourses = newFetchParams.currentPage;
          }
          patchState({
            courses,
            paginatedPublicCourses,
            lastPagePublicCourses,
            fetchCoursesParamObjects: state.fetchCoursesParamObjects.concat([
              newFetchParams,
            ]),
            isFetchingCourses: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingCourses: false });
        }
      );
  }

  // *********************************
  @Action(ResetPublicInstitutionFormAction)
  resetPublicInstitutionFormAction({
    patchState,
  }: StateContext<PublicStateModel>) {
    patchState({
      isFetchingFormRecord: false,
      institutionFormRecord: defaultPublicState.institutionFormRecord,
    });
  }

  @Action(ResetPublicHomePageListsAction)
  resetPublicHomePageListsAction({
    patchState,
  }: StateContext<PublicStateModel>) {
    patchState({
      isFetchingMembers: false,
      memberFormRecord: defaultPublicState.memberFormRecord,
      members: defaultPublicState.members,
      isFetchingInstitutions: false,
      institutionFormRecord: defaultPublicState.institutionFormRecord,
      institutions: defaultPublicState.institutions,
    });
  }
}

