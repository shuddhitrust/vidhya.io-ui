import {
  FetchPolicy,
  Course,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';

export const emptyCourseFormRecord: Course = {
  id: null,
  title: null,
  description: null,
  instructor: null,
  institutions: [],
};
export interface CourseStateModel {
  courses: Course[];
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
  'dashboard?adminSection=Institutions&tab=Courses';
