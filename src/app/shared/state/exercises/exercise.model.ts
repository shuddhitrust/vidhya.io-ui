import {
  FetchPolicy,
  Exercise,
  FetchParams,
  startingFetchParams,
} from '../../common/models';

export const emptyExerciseFormRecord: Exercise = {
  id: null,
  prompt: null,
  chapter: null,
  questionType: null,
  required: true,
  options: null,
  points: null
};
export interface ExerciseStateModel {
  exercises: Exercise[];
  lastPage: number;
  exercisesSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  exerciseFormId: number;
  exerciseFormRecord: Exercise;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultExerciseState: ExerciseStateModel = {
  exercises: [],
  lastPage: null,
  exercisesSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  exerciseFormId: null,
  exerciseFormRecord: emptyExerciseFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ExerciseFormCloseURL =
  'dashboard?adminSection=Institutions&tab=Exercises';
