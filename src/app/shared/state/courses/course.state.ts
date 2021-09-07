import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultCourseState,
  emptyCourseFormRecord,
  CourseFormCloseURL,
  CourseStateModel,
} from './course.model';

import { Injectable } from '@angular/core';
import {
  CourseSubscriptionAction,
  CreateUpdateCourseAction,
  DeleteCourseAction,
  FetchCoursesAction,
  FetchNextCoursesAction,
  ForceRefetchCoursesAction,
  GetCourseAction,
  PublishCourseAction,
  ResetCourseFormAction,
} from './course.actions';
import { COURSE_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Course,
  MatSelectOption,
  FetchParams,
  SUBSCRIPTION_METHODS,
} from '../../common/models';
import { COURSE_MUTATIONS } from '../../api/graphql/mutations.graphql';
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
import { StateContextFactory } from '@ngxs/store/src/internal/state-context-factory';
import { uiroutes } from '../../common/ui-routes';

@State<CourseStateModel>({
  name: 'courseState',
  defaults: defaultCourseState,
})
@Injectable()
export class CourseState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listCourses(state: CourseStateModel): Course[] {
    return state.courses;
  }

  @Selector()
  static isFetching(state: CourseStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: CourseStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listCourseOptions(state: CourseStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.courses.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.title,
      };
      return option;
    });
    
    return options;
  }

  @Selector()
  static errorFetching(state: CourseStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: CourseStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: CourseStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getCourseFormRecord(state: CourseStateModel): Course {
    return state.courseFormRecord;
  }

  @Action(ForceRefetchCoursesAction)
  forceRefetchCourses({ patchState }: StateContext<CourseStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchCoursesAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchNextCoursesAction)
  fetchNextCourses({ getState }: StateContext<CourseStateModel>) {
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
        new FetchCoursesAction({ searchParams: newSearchParams })
      );
    }
  }
  @Action(FetchCoursesAction)
  fetchCourses(
    { getState, patchState }: StateContext<CourseStateModel>,
    { payload }: FetchCoursesAction
  ) {
    
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects, coursesSubscribed } = state;
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
      
      this.apollo
        .watchQuery({
          query: COURSE_QUERIES.GET_COURSES,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(
          ({ data }: any) => {
            
            const response = data.courses;
            const totalCount = response[0]?.totalCount
              ? response[0]?.totalCount
              : 0;
            newFetchParams = { ...newFetchParams, totalCount };
            let paginatedCourses = state.paginatedCourses;
            paginatedCourses = {
              ...paginatedCourses,
              [pageNumber]: response,
            };
            let courses = convertPaginatedListToNormalList(paginatedCourses);
            let lastPage = null;
            if (response.length < newFetchParams.pageSize) {
              lastPage = newFetchParams.currentPage;
            }
            patchState({
              courses,
              paginatedCourses,
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

  @Action(CourseSubscriptionAction)
  subscribeToCourses({ getState, patchState }: StateContext<CourseStateModel>) {
    const state = getState();
    if (!state.coursesSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.course,
        })
        .subscribe((result: any) => {
          const state = getState();
          const method = result?.data?.notifyCourse?.method;
          const course = result?.data?.notifyCourse?.course;
          const { newPaginatedItems, newItemsList } =
            paginatedSubscriptionUpdater({
              paginatedItems: state.paginatedCourses,
              method,
              modifiedItem: course,
            });
          patchState({
            courses: newItemsList,
            paginatedCourses: newPaginatedItems,
            coursesSubscribed: true,
          });
        });
    }
  }

  @Action(GetCourseAction)
  getCourse(
    { patchState }: StateContext<CourseStateModel>,
    { payload }: GetCourseAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: COURSE_QUERIES.GET_COURSE,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.course;
          patchState({ courseFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateCourseAction)
  createUpdateCourse(
    { getState, patchState }: StateContext<CourseStateModel>,
    { payload }: CreateUpdateCourseAction
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
            ? COURSE_MUTATIONS.UPDATE_COURSE
            : COURSE_MUTATIONS.CREATE_COURSE,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm ? data.updateCourse : data.createCourse;
            patchState({ formSubmitting: false });
            
            if (response.ok) {
              const method = updateForm
                ? SUBSCRIPTION_METHODS.UPDATE_METHOD
                : SUBSCRIPTION_METHODS.CREATE_METHOD;
              const course = response.course;
              const { newPaginatedItems, newItemsList } =
                paginatedSubscriptionUpdater({
                  paginatedItems: state.paginatedCourses,
                  method,
                  modifiedItem: course,
                });

              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(CourseFormCloseURL);
              patchState({
                paginatedCourses: newPaginatedItems,
                courses: newItemsList,
                courseFormRecord: emptyCourseFormRecord,
                fetchPolicy: 'network-only',
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Course ${
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

  @Action(DeleteCourseAction)
  deleteCourse(
    { getState, patchState }: StateContext<CourseStateModel>,
    { payload }: DeleteCourseAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: COURSE_MUTATIONS.DELETE_COURSE,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteCourse;
          
          if (response.ok) {
            this.router.navigateByUrl(CourseFormCloseURL);
            const method = SUBSCRIPTION_METHODS.DELETE_METHOD;
            const course = response.course;
            const state = getState();
            const { newPaginatedItems, newItemsList } =
              paginatedSubscriptionUpdater({
                paginatedItems: state.paginatedCourses,
                method,
                modifiedItem: course,
              });
            patchState({
              paginatedCourses: newPaginatedItems,
              courses: newItemsList,
              courseFormRecord: emptyCourseFormRecord,
            });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Course deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchCoursesAction({
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

  @Action(PublishCourseAction)
  PublishCourseAction(
    {}: StateContext<CourseStateModel>,
    { payload }: PublishCourseAction
  ) {
    let { id, publishChapters } = payload;
    this.apollo
      .mutate({
        mutation: COURSE_MUTATIONS.PUBLISH_COURSE,
        variables: { id, publishChapters },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.publishCourse;
          
          if (response.ok) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: `Course ${
                  publishChapters ? 'and its chapters' : ''
                } published successfully!`,
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

  @Action(ResetCourseFormAction)
  resetCourseForm({ patchState }: StateContext<CourseStateModel>) {
    patchState({
      courseFormRecord: emptyCourseFormRecord,
      formSubmitting: false,
    });
  }
}
