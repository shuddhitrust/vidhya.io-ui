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
  ResetChapterFormAction,
  SetCourseInChapterForm,
} from './chapter.actions';
import { CHAPTER_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { Chapter, MatSelectOption, FetchParams } from '../../common/models';
import { CHAPTER_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  fetchParamsNewOrNot,
  subscriptionUpdater,
  updateFetchParams,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';
import { SUBSCRIPTIONS } from '../../api/graphql/subscriptions.graphql';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { Location } from '@angular/common';

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
    const newPageNumber =
      state.fetchParamObjects[state.fetchParamObjects.length - 1].currentPage +
      1;
    const newSearchParams: SearchParams = {
      ...defaultSearchParams,
      newPageNumber,
    };
    if (
      !lastPageNumber ||
      (lastPageNumber != null && newPageNumber <= lastPageNumber)
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
    const { newSearchQuery, newPageSize, newPageNumber, newColumnFilters } =
      searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber,
      newPageSize,
      newSearchQuery,
      newColumnFilters,
    });
    const variables = {
      courseId: newColumnFilters.courseId,
      searchField: newSearchQuery,
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
            let chapters = state.chapters;
            chapters = chapters.concat(response);
            let lastPage = null;
            if (response.length < newFetchParams.pageSize) {
              lastPage = newFetchParams.currentPage;
            }
            patchState({
              chapters,
              lastPage,
              fetchParamObjects: state.fetchParamObjects.concat([
                newFetchParams,
              ]),
              isFetching: false,
            });
            if (!chaptersSubscribed) {
              this.store.dispatch(new ChapterSubscriptionAction());
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
          const { items, fetchParamObjects } = subscriptionUpdater({
            items: state.chapters,
            method,
            subscriptionItem: chapter,
            fetchParamObjects: state.fetchParamObjects,
          });
          patchState({
            chapters: items,
            fetchParamObjects,
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
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Chapter ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              // this.router.navigateByUrl(ChapterFormCloseURL);
              this.location.back();
              patchState({
                chapterFormRecord: emptyChapterFormRecord,
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

  @Action(DeleteChapterAction)
  deleteChapter(
    {}: StateContext<ChapterStateModel>,
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
}
