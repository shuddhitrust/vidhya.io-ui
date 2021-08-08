import {
  FetchPolicy,
  ExerciseSubmission,
  FetchParams,
  startingFetchParams,
} from '../../common/models';

export const emptyExerciseSubmissionFormRecord: ExerciseSubmission = {
  id: null,
  exercise: null,
  chapter: null,
  course: null,
  participant: null,
  option: null,
  answer: null,
  images: null,
  points: null,
};
export interface ExerciseSubmissionStateModel {
  exerciseSubmissions: ExerciseSubmission[];
  lastPage: number;
  exerciseSubmissionsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  exerciseSubmissionFormId: number;
  exerciseSubmissionFormRecord: ExerciseSubmission;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultExerciseSubmissionState: ExerciseSubmissionStateModel = {
  exerciseSubmissions: [],
  lastPage: null,
  exerciseSubmissionsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  exerciseSubmissionFormId: null,
  exerciseSubmissionFormRecord: emptyExerciseSubmissionFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ExerciseSubmissionFormCloseURL =
  'dashboard?adminSection=Institutions&tab=ExerciseSubmissions';
