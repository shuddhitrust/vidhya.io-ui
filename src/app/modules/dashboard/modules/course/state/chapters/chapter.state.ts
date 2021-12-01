import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultChapterState,
  emptyChapterFormRecord,
  ChapterStateModel,
} from './chapter.model';

import { Injectable } from '@angular/core';
import {
  ChapterSubscriptionAction,
  CreateUpdateChapterAction,
  DeleteChapterAction,
  FetchChaptersAction,
  FetchNextChaptersAction,
  ForceRefetchChaptersAction,
  GetChapterAction,
  PublishChapterAction,
  ReorderChaptersAction,
  ResetChapterFormAction,
  SetCourseInChapterForm,
} from './chapter.actions';
import { CHAPTER_QUERIES } from '../../../../../../shared/api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Chapter,
  MatSelectOption,
  FetchParams,
  SUBSCRIPTION_METHODS,
  startingFetchParams,
} from '../../../../../../shared/common/models';
import { CHAPTER_MUTATIONS } from '../../../../../../shared/api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../../../../../../shared/state/notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  subscriptionUpdater,
  updateFetchParams,
  convertPaginatedListToNormalList,
  paginatedSubscriptionUpdater,
  sortByIndex,
  sortArrayOfObjectsByString,
} from '../../../../../../shared/common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../../../../../shared/common/constants';
import { SUBSCRIPTIONS } from '../../../../../../shared/api/graphql/subscriptions.graphql';
import { SearchParams } from '../../../../../../shared/modules/master-grid/table.model';
import { Location } from '@angular/common';
import { uiroutes } from '../../../../../../shared/common/ui-routes';

@State<ChapterStateModel>({
  name: 'chapterState',
  defaults: defaultChapterState,
})
@Injectable()
export class ChapterState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router,
    private location: Location
  ) {}

  @Selector()
  static listChapters(state: ChapterStateModel): Chapter[] {
    return state.chapters;
  }

  @Selector()
  static isFetching(state: ChapterStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: ChapterStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }

  @Selector()
  static listChapterOptions(state: ChapterStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.chapters.map((i) => {
      let sectionIndex: any = i.section?.index ? i.section?.index + '.' : '';
      sectionIndex =
        parseInt(sectionIndex, 10) < 10
          ? '0' + sectionIndex.toString()
          : sectionIndex.toString();

      const option: MatSelectOption = {
        value: i.id,
        label: sectionIndex + i.index + ' ' + i.title,
      };
      return option;
    });

    const sortedOptions = sortArrayOfObjectsByString(options, 'label');
    return sortedOptions;
  }

  @Selector()
  static errorFetching(state: ChapterStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: ChapterStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: ChapterStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getChapterFormRecord(state: ChapterStateModel): Chapter {
    return state.chapterFormRecord;
  }

  @Action(SetCourseInChapterForm)
  setCourseInChapterForm(
    { getState, patchState }: StateContext<ChapterStateModel>,
    { payload }: SetCourseInChapterForm
  ) {
    const { courseId } = payload;
    const state = getState();
    let { chapterFormRecord } = state;
    chapterFormRecord = { ...chapterFormRecord, course: courseId };
    patchState({ chapterFormRecord });
  }

  @Action(ForceRefetchChaptersAction)
  forceRefetchChapters({
    getState,
    patchState,
  }: StateContext<ChapterStateModel>) {
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
      new FetchChaptersAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchNextChaptersAction)
  fetchNextChapters({ getState }: StateContext<ChapterStateModel>) {
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
        new FetchChaptersAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchChaptersAction)
  fetchChapters(
    { getState, patchState }: StateContext<ChapterStateModel>,
    { payload }: FetchChaptersAction
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
      courseId: columnFilters?.courseId,
      searchField: searchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    patchState({ isFetching: true });

    this.apollo
      .watchQuery({
        query: CHAPTER_QUERIES.GET_CHAPTERS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.chapters;

          newFetchParams = { ...newFetchParams };
          let paginatedChapters = state.paginatedChapters;
          paginatedChapters = {
            ...paginatedChapters,
            [pageNumber]: response,
          };

          let chapters = convertPaginatedListToNormalList(paginatedChapters);
          let lastPage = null;
          if (response.length < newFetchParams.pageSize) {
            lastPage = newFetchParams.currentPage;
          }
          patchState({
            chapters,
            paginatedChapters,
            lastPage,
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

  @Action(ChapterSubscriptionAction)
  subscribeToChapters({
    getState,
    patchState,
  }: StateContext<ChapterStateModel>) {
    const state = getState();
    if (!state.chaptersSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.chapter,
        })
        .subscribe((result: any) => {
          const state = getState();
          const method = result?.data?.notifyChapter?.method;
          const chapter = result?.data?.notifyChapter?.chapter;
          const { newPaginatedItems, newItemsList } =
            paginatedSubscriptionUpdater({
              paginatedItems: state.paginatedChapters,
              method,
              modifiedItem: chapter,
            });
          patchState({
            chapters: newItemsList,
            paginatedChapters: newPaginatedItems,
            chaptersSubscribed: true,
          });
        });
    }
  }

  @Action(GetChapterAction)
  getChapter(
    { patchState }: StateContext<ChapterStateModel>,
    { payload }: GetChapterAction
  ) {
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: CHAPTER_QUERIES.GET_CHAPTER,
        variables: payload,
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.chapter;
          patchState({ chapterFormRecord: response, isFetching: false });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          this.router.navigate([uiroutes.DASHBOARD_ROUTE.route]);
          patchState({ isFetching: false });
        }
      );
  }

  @Action(CreateUpdateChapterAction)
  createUpdateChapter(
    { getState, patchState }: StateContext<ChapterStateModel>,
    { payload }: CreateUpdateChapterAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting, fetchPolicy } = state;
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
            ? CHAPTER_MUTATIONS.UPDATE_CHAPTER
            : CHAPTER_MUTATIONS.CREATE_CHAPTER,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm
              ? data.updateChapter
              : data.createChapter;
            patchState({ formSubmitting: false });

            if (response.ok) {
              const method = updateForm
                ? SUBSCRIPTION_METHODS.UPDATE_METHOD
                : SUBSCRIPTION_METHODS.CREATE_METHOD;
              const chapter = response.chapter;
              const { newPaginatedItems, newItemsList } =
                paginatedSubscriptionUpdater({
                  paginatedItems: state.paginatedChapters,
                  method,
                  modifiedItem: chapter,
                });

              form.reset();
              formDirective.resetForm();
              // this.router.navigateByUrl(ChapterFormCloseURL);
              this.location.back();
              patchState({
                paginatedChapters: newPaginatedItems,
                chapters: newItemsList,
                chapterFormRecord: emptyChapterFormRecord,
                fetchPolicy,
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Chapter ${
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

  @Action(PublishChapterAction)
  PublishCourseAction(
    {}: StateContext<ChapterStateModel>,
    { payload }: PublishChapterAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: CHAPTER_MUTATIONS.PUBLISH_CHAPTER,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.publishCourse;

          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: `Chapter published successfully!`,
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

  @Action(DeleteChapterAction)
  deleteChapter(
    { getState, patchState }: StateContext<ChapterStateModel>,
    { payload }: DeleteChapterAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: CHAPTER_MUTATIONS.DELETE_CHAPTER,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteChapter;

          if (response.ok) {
            const method = SUBSCRIPTION_METHODS.DELETE_METHOD;
            const chapter = response.chapter;
            const redirectUrl =
              uiroutes.COURSE_PROFILE_ROUTE.route +
              `?id=${chapter?.course?.id}`;
            this.router.navigateByUrl(redirectUrl);
            const state = getState();
            const { newPaginatedItems, newItemsList } =
              paginatedSubscriptionUpdater({
                paginatedItems: state.paginatedChapters,
                method,
                modifiedItem: chapter,
              });
            patchState({
              paginatedChapters: newPaginatedItems,
              chapters: newItemsList,
              chapterFormRecord: emptyChapterFormRecord,
            });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Chapter deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(new ForceRefetchChaptersAction());
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

  @Action(ResetChapterFormAction)
  resetChapterForm({ patchState }: StateContext<ChapterStateModel>) {
    patchState({
      chapterFormRecord: emptyChapterFormRecord,
      formSubmitting: false,
    });
  }
  @Action(ReorderChaptersAction)
  reorderChapters(
    {}: StateContext<ChapterStateModel>,
    { payload }: ReorderChaptersAction
  ) {
    const { indexList } = payload;
    this.apollo
      .mutate({
        mutation: CHAPTER_MUTATIONS.REORDER_CHAPTERS,
        variables: { indexList },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.reorderChapters;
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
}
