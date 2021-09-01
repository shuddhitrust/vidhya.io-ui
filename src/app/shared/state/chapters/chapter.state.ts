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
import { CHAPTER_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Chapter,
  MatSelectOption,
  FetchParams,
  SUBSCRIPTION_METHODS,
} from '../../common/models';
import { CHAPTER_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  fetchParamsNewOrNot,
  subscriptionUpdater,
  updateFetchParams,
  convertPaginatedListToNormalList,
  paginatedSubscriptionUpdater,
  sortByIndex,
  sortArrayOfObjectsByString,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';
import { SUBSCRIPTIONS } from '../../api/graphql/subscriptions.graphql';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { Location } from '@angular/common';
import { CourseFormCloseURL } from '../courses/course.model';
import { uiroutes } from '../../common/ui-routes';

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
      console.log('chapter to option => ', { chapter: i });
      let sectionIndex: any = i.section?.index ? i.section?.index + '.' : '';
      sectionIndex =
        parseInt(sectionIndex, 10) < 10
          ? '0' + sectionIndex.toString()
          : sectionIndex.toString();
      console.log('from list chapter options => ', { sectionIndex });
      const option: MatSelectOption = {
        value: i.id,
        label: sectionIndex + i.index + ' ' + i.title,
      };
      return option;
    });
    console.log('chapter options', options);
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
  forceRefetchChapters({ patchState }: StateContext<ChapterStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchChaptersAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchNextChaptersAction)
  fetchNextChapters({ getState }: StateContext<ChapterStateModel>) {
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
        new FetchChaptersAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchChaptersAction)
  fetchChapters(
    { getState, patchState }: StateContext<ChapterStateModel>,
    { payload }: FetchChaptersAction
  ) {
    console.log('Fetching chapters from chapter state');
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects, chaptersSubscribed } = state;
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
    if (fetchParamsNewOrNot({ fetchParamObjects, newFetchParams })) {
      patchState({ isFetching: true });
      console.log('variables for chapters fetch ', { variables });
      this.apollo
        .watchQuery({
          query: CHAPTER_QUERIES.GET_CHAPTERS,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(
          ({ data }: any) => {
            console.log('resposne to get chapters query ', { data });
            const response = data.chapters;
            const totalCount = response[0]?.totalCount
              ? response[0]?.totalCount
              : 0;
            newFetchParams = { ...newFetchParams, totalCount };
            console.log('from after getting chapters', {
              totalCount,
              response,
              newFetchParams,
            });
            let paginatedChapters = state.paginatedChapters;
            paginatedChapters = {
              ...paginatedChapters,
              [pageNumber]: response,
            };
            console.log({ paginatedChapters });
            let chapters = convertPaginatedListToNormalList(paginatedChapters);
            let lastPage = null;
            if (response.length < newFetchParams.pageSize) {
              lastPage = newFetchParams.currentPage;
            }
            patchState({
              chapters,
              paginatedChapters,
              lastPage,
              fetchParamObjects: state.fetchParamObjects.concat([
                newFetchParams,
              ]),
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
          console.log('chapter subscription result ', {
            chapters: state.chapters,
            result,
          });
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
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: CHAPTER_QUERIES.GET_CHAPTER,
        variables: { id },
        fetchPolicy: 'network-only',
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
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;
      console.log('Chapter Form values', values);
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
            console.log('update chapter ', { response });
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
                fetchPolicy: 'network-only',
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
            console.log('From createUpdateChapter', { response });
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
          console.log('from publish chapter ', { data });
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
          console.log('from delete chapter ', { data });
          if (response.ok) {
            const method = SUBSCRIPTION_METHODS.DELETE_METHOD;
            const chapter = response.chapter;
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
            this.store.dispatch(
              new ForceRefetchChaptersAction({
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
          console.log('Reordering of chapters ', { response });
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
