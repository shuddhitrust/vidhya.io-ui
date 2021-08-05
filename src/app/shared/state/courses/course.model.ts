import { COURSES } from 'src/app/pages/static/dashboard/dashboard.component';
import {
  FetchPolicy,
  Course,
  FetchParams,
  startingFetchParams,
  CourseStatusOptions,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

export const emptyCourseFormRecord: Course = {
  id: null,
  title: null,
  blurb: null,
  description: null,
  instructor: null,
  institutions: [],
  participants: [],
  mandatoryPrerequisites: [],
  recommendedPrerequisites: [],
  startDate: null,
  endDate: null,
  creditHours: null,
  status: 'DR',
};
export interface CourseStateModel {
  courses: Course[];
  lastPage: number;
  coursesSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  courseFormId: number;
  courseFormRecord: Course;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultCourseState: CourseStateModel = {
  courses: [],
  lastPage: null,
  coursesSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  courseFormId: null,
  courseFormRecord: emptyCourseFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const CourseFormCloseURL =
  uiroutes.DASHBOARD_ROUTE.route + '?tab=' + COURSES;
