import {
  FetchPolicy,
  Exercise,
  FetchParams,
  startingFetchParams,
  ExerciseKey,
  ExerciseSubmission,
} from '../../common/models';

export const emptyExerciseFormRecord: Exercise = {
  id: null,
  prompt: null,
  chapter: null,
  course: null,
  questionType: null,
  required: true,
  options: null,
  points: null,
};

export const emptyExerciseKeyFormRecord: ExerciseKey = {
  id: null,
  exercise: emptyExerciseFormRecord,
  chapter: null,
  course: null,
  validOption: null,
  validAnswers: [''],
  referenceLink: null,
  referenceImages: [],
};

export interface ExerciseStateModel {
  exercises: Exercise[];
  submissions: ExerciseSubmission[];
  paginatedExercises: any;
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
  submissions: [],
  paginatedExercises: {},
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
