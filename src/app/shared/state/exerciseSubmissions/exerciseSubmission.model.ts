import {
  FetchPolicy,
  ExerciseSubmission,
  FetchParams,
  startingFetchParams,
} from '../../common/models';
import { emptyExerciseFormRecord } from '../exercises/exercise.model';

export type GradingGroup = {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  count: number;
};

export const emptyGradingGroup: GradingGroup = {
  id: null,
  type: null,
  title: null,
  subtitle: null,
  count: null,
};
export const emptyExerciseSubmissionFormRecord: ExerciseSubmission = {
  id: null,
  exercise: null,
  chapter: null,
  course: null,
  participant: null,
  option: null,
  answer: null,
  images: null,
  link: null,
  points: null,
  percentage: null,
  status: null,
  remarks: null,
  createdAt: null,
};
export interface ExerciseSubmissionStateModel {
  exerciseSubmissions: ExerciseSubmission[];
  paginatedExerciseSubmissions: any;
  lastPage: number;
  gradingGroups: GradingGroup[];
  paginatedGradingGroups: any;
  gradingGroupLastPage: number;
  gradingGroupsfetchParamObjects: FetchParams[];
  exerciseSubmissionsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  exerciseSubmissionFormId: number;
  exerciseSubmissionFormRecord: ExerciseSubmission;
  isFetching: boolean;
  isFetchingGradingGroups: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultExerciseSubmissionState: ExerciseSubmissionStateModel = {
  exerciseSubmissions: [],
  paginatedExerciseSubmissions: {},
  lastPage: null,
  gradingGroups: [],
  paginatedGradingGroups: {},
  gradingGroupsfetchParamObjects: [],
  gradingGroupLastPage: null,
  exerciseSubmissionsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  exerciseSubmissionFormId: null,
  exerciseSubmissionFormRecord: emptyExerciseSubmissionFormRecord,
  isFetching: false,
  isFetchingGradingGroups: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ExerciseSubmissionFormCloseURL = 'dashboard?tab=Grading';
