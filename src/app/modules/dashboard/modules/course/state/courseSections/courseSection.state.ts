import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultCourseSectionState,
  emptyCourseSectionFormRecord,
  CourseSectionFormCloseURL,
  CourseSectionStateModel,
} from './courseSection.model';

import { Injectable } from '@angular/core';
import {
  CourseSectionSubscriptionAction,
  CreateUpdateCourseSectionAction,
  DeleteCourseSectionAction,
  FetchCourseSectionsAction,
  GetCourseSectionAction,
  ReorderCourseSectionsAction,
  ResetCourseSectionFormAction,
} from './courseSection.actions';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import {
  CourseSection,
  FetchParams,
  MatSelectOption,
  SUBSCRIPTION_METHODS,
} from 'src/app/shared/common/models';
import {
  convertPaginatedListToNormalList,
  getErrorMessageFromGraphQLResponse,
  paginatedSubscriptionUpdater,
  sortByIndex,
  subscriptionUpdater,
  updateFetchParams,
} from 'src/app/shared/common/functions';
import { COURSE_SECTION_QUERIES } from 'src/app/shared/api/graphql/queries.graphql';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { SUBSCRIPTIONS } from 'src/app/shared/api/graphql/subscriptions.graphql';
import { COURSE_SECTION_MUTATIONS } from 'src/app/shared/api/graphql/mutations.graphql';

@State<CourseSectionStateModel>({
  name: 'courseSectionState',
  defaults: defaultCourseSectionState,
})
@Injectable()
export class CourseSectionState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listCourseSections(state: CourseSectionStateModel): CourseSection[] {
    return state.courseSections;
  }

  @Selector()
  static isFetching(state: CourseSectionStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: CourseSectionStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listCourseSectionOptions(
    state: CourseSectionStateModel
  ): MatSelectOption[] {
    const options: MatSelectOption[] = state.courseSections.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.index + ' ' + i.title,
      };
      return option;
    });

    return options;
  }

  @Selector()
  static errorFetching(state: CourseSectionStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: CourseSectionStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: CourseSectionStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getCourseSectionFormRecord(
    state: CourseSectionStateModel
  ): CourseSection {
    return state.courseSectionFormRecord;
  }

  @Action(FetchCourseSectionsAction)
  fetchCourseSections(
    { getState, patchState }: StateContext<CourseSectionStateModel>,
    { payload }: FetchCourseSectionsAction
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
      courseId: columnFilters.courseId,
    };
    patchState({ isFetching: true });

    this.apollo
      .watchQuery({
        query: COURSE_SECTION_QUERIES.GET_COURSE_SECTIONS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.courseSections;
          newFetchParams = { ...newFetchParams };
          let paginatedCourseSections = state.paginatedCourseSections;
          paginatedCourseSections = {
            ...paginatedCourseSections,
            [pageNumber]: response,
          };
          let courseSections = convertPaginatedListToNormalList(
            paginatedCourseSections
          );
          let lastPage = null;
          if (response.length < newFetchParams.pageSize) {
            lastPage = newFetchParams.currentPage;
          }
          patchState({
            courseSections,
            paginatedCourseSections,
            lastPage,
            fetchParamObjects: state.fetchParamObjects.concat([newFetchParams]),
            isFetching: false,
          });
          patchState({
            courseSections: response,
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

  @Action(CourseSectionSubscriptionAction)
  subscribeToCourseSections({
    getState,
    patchState,
  }: StateContext<CourseSectionStateModel>) {
    const state = getState();
    if (!state.courseSectionsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.courseSection,
        })
        .subscribe((result: any) => {
          const state = getState();
          const method = result?.data?.notifyCourseSection?.method;
          const courseSection =
            result?.data?.notifyCourseSection?.courseSection;
          if (method == SUBSCRIPTION_METHODS.CREATE_METHOD) {
          }
          const { items, fetchParamObjects } = subscriptionUpdater({
            items: state.courseSections,
            method,
            subscriptionItem: courseSection,
            fetchParamObjects: state.fetchParamObjects,
          });
          const newItemsList = sortByIndex(items);
          patchState({
            courseSections: newItemsList,
            fetchParamObjects,
            courseSectionsSubscribed: true,
          });
        });
    }
  }

  @Action(GetCourseSectionAction)
  getCourseSection(
    { patchState }: StateContext<CourseSectionStateModel>,
    { payload }: GetCourseSectionAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: COURSE_SECTION_QUERIES.GET_COURSE_SECTION,
        variables: { id },
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-and-network',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.courseSection;
          patchState({ courseSectionFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateCourseSectionAction)
  createUpdateCourseSection(
    { getState, patchState }: StateContext<CourseSectionStateModel>,
    { payload }: CreateUpdateCourseSectionAction
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
            ? COURSE_SECTION_MUTATIONS.UPDATE_COURSE_SECTION
            : COURSE_SECTION_MUTATIONS.CREATE_COURSE_SECTION,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm
              ? data.updateCourseSection
              : data.createCourseSection;
            patchState({ formSubmitting: false });

            if (response.ok) {
              const method = updateForm
                ? SUBSCRIPTION_METHODS.UPDATE_METHOD
                : SUBSCRIPTION_METHODS.CREATE_METHOD;
              const courseSection = response.courseSection;

              const { newPaginatedItems, newItemsList } =
                paginatedSubscriptionUpdater({
                  paginatedItems: state.paginatedCourseSections,
                  method,
                  modifiedItem: courseSection,
                });

              form.reset();
              formDirective.resetForm();
              // this.router.navigateByUrl(CourseSectionFormCloseURL);
              patchState({
                paginatedCourseSections: newPaginatedItems,
                courseSections: newItemsList,
                courseSectionFormRecord: emptyCourseSectionFormRecord,
                fetchPolicy: 'network-only',
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `CourseSection ${
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

  @Action(DeleteCourseSectionAction)
  deleteCourseSection(
    { getState, patchState }: StateContext<CourseSectionStateModel>,
    { payload }: DeleteCourseSectionAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: COURSE_SECTION_MUTATIONS.DELETE_COURSE_SECTION,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteCourseSection;

          if (response.ok) {
            const method = SUBSCRIPTION_METHODS.DELETE_METHOD;
            const courseSection = response.courseSection;
            const state = getState();
            const { newPaginatedItems, newItemsList } =
              paginatedSubscriptionUpdater({
                paginatedItems: state.paginatedCourseSections,
                method,
                modifiedItem: courseSection,
              });
            patchState({
              paginatedCourseSections: newPaginatedItems,
              courseSections: newItemsList,
              courseSectionFormRecord: emptyCourseSectionFormRecord,
            });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'CourseSection deleted successfully!',
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

  @Action(ResetCourseSectionFormAction)
  resetCourseSectionForm({
    patchState,
  }: StateContext<CourseSectionStateModel>) {
    patchState({
      courseSectionFormRecord: emptyCourseSectionFormRecord,
      formSubmitting: false,
    });
  }

  @Action(ReorderCourseSectionsAction)
  reorderChapters(
    {}: StateContext<CourseSectionStateModel>,
    { payload }: ReorderCourseSectionsAction
  ) {
    const { indexList } = payload;
    this.apollo
      .mutate({
        mutation: COURSE_SECTION_MUTATIONS.REORDER_COURSE_SECTIONS,
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
