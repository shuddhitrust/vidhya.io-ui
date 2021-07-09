import { COURSES } from 'src/app/pages/static/dashboard/dashboard.component';
import {
  FetchPolicy,
  Course,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

export const emptyCourseFormRecord: Course = {
  id: null,
  title: null,
  description: null,
  instructor: null,
  institutions: [],
};
export interface CourseStateModel {
  courses: Course[];
  coursesSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  courseFormId: number;
  courseFormRecord: Course;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultCourseState: CourseStateModel = {
  courses: [],
  coursesSubscribed: false,
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  courseFormId: null,
  courseFormRecord: emptyCourseFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const CourseFormCloseURL =
  uiroutes.DASHBOARD_ROUTE.route + '?tab=' + COURSES;
