import {
  FetchPolicy,
  ExerciseSubmission,
  FetchParams,
  startingFetchParams,
} from '../../common/models';

export const emptyExerciseSubmissionFormRecord: ExerciseSubmission = {
  id: null,
  title: null,
  author: null,
  message: null,
  institution: null,
  groups: [],
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
