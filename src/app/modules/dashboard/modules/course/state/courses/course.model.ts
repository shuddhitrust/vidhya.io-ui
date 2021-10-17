import { COURSES } from 'src/app/modules/dashboard/dashboard.component';
import {
  Course,
  FetchParams,
  FetchPolicyModel,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';

export const emptyCourseFormRecord: Course = {
  id: null,
  title: null,
  index: null,
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
  paginatedCourses: any;
  lastPage: number;
  coursesSubscribed: boolean;
  fetchPolicy: FetchPolicyModel;
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
  paginatedCourses: {},
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
