import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultCourseState,
  emptyCourseFormRecord,
  CourseFormCloseURL,
  CourseStateModel,
} from './course.model';

import { Injectable } from '@angular/core';
import {
  CreateUpdateCourseAction,
  DeleteCourseAction,
  FetchCoursesAction,
  ForceRefetchCoursesAction,
  GetCourseAction,
  ResetCourseFormAction,
} from './course.actions';
import { COURSE_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { Course, MatSelectOption, PaginationObject } from '../../common/models';
import { COURSE_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  updatePaginationObject,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';

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
  static paginationObject(state: CourseStateModel): PaginationObject {
    return state.paginationObject;
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
    console.log('options', options);
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

  @Action(FetchCoursesAction)
  fetchCourses(
    { getState, patchState }: StateContext<CourseStateModel>,
    { payload }: FetchCoursesAction
  ) {
    console.log('Fetching courses from course state');
    patchState({ isFetching: true });
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, paginationObject } = state;
    const { searchQuery, newPageSize, newPageNumber } = searchParams;
    const newPaginationObject = updatePaginationObject({
      paginationObject,
      newPageNumber,
      newPageSize,
    });
    const variables = {
      searchField: searchQuery,
      limit: newPaginationObject.pageSize,
      offset: newPaginationObject.offset,
    };
    console.log('variables for courses fetch ', { variables });
    this.apollo
      .watchQuery({
        query: COURSE_QUERIES.GET_COURSES,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(({ data }: any) => {
        console.log('resposne to get courses query ', { data });
        const response = data.courses;
        const totalCount = response[0]?.totalCount
          ? response[0]?.totalCount
          : 0;
        newPaginationObject.totalCount = totalCount;
        console.log('from after getting courses', {
          totalCount,
          response,
          newPaginationObject,
        });
        patchState({
          courses: response,
          paginationObject: newPaginationObject,
          isFetching: false,
        });
      });
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
      .valueChanges.subscribe(({ data }: any) => {
        const response = data.course;
        patchState({ courseFormRecord: response, isFetching: false });
      });
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
      console.log('Course Form values', values);
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
            console.log('update course ', { response });
            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Course ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(CourseFormCloseURL);
              patchState({
                courseFormRecord: emptyCourseFormRecord,
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
            console.log('From createUpdateCourse', { response });
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

  @Action(DeleteCourseAction)
  deleteCourse(
    {}: StateContext<CourseStateModel>,
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
          console.log('from delete course ', { data });
          if (response.ok) {
            this.router.navigateByUrl(CourseFormCloseURL);
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

  @Action(ResetCourseFormAction)
  resetCourseForm({ patchState }: StateContext<CourseStateModel>) {
    patchState({
      courseFormRecord: emptyCourseFormRecord,
      formSubmitting: false,
    });
  }
}
