import { COURSES } from 'src/app/modules/dashboard/dashboard.component';
import { FetchPolicy, CourseSection, FetchParams } from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

export const emptyCourseSectionFormRecord: CourseSection = {
  id: null,
  title: null,
  index: null,
  course: null,
};
export interface CourseSectionStateModel {
  courseSections: CourseSection[];
  paginatedCourseSections: any;
  lastPage: number;
  courseSectionsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  courseSectionFormId: number;
  courseSectionFormRecord: CourseSection;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultCourseSectionState: CourseSectionStateModel = {
  courseSections: [],
  paginatedCourseSections: {},
  lastPage: null,
  courseSectionsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  courseSectionFormId: null,
  courseSectionFormRecord: emptyCourseSectionFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const CourseSectionFormCloseURL =
  uiroutes.DASHBOARD_ROUTE.route + '?tab=' + COURSES;
