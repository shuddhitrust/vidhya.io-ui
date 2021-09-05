import {
  FetchPolicy,
  ExerciseKey,
  FetchParams,
  startingFetchParams,
} from '../../common/models';

export const emptyExerciseKeyFormRecord: ExerciseKey = {
  id: null,
  exercise: null,
  chapter: null,
  course: null,
  validOption: null,
  validAnswers: [],
  referenceLink: null,
  referenceImages: [],
  remarks: null,
};
export interface ExerciseKeyStateModel {
  exerciseKeys: ExerciseKey[];
  paginatedExerciseKeys: any;
  lastPage: number;
  exerciseKeysSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  exerciseKeyFormId: number;
  exerciseKeyFormRecord: ExerciseKey;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultExerciseKeyState: ExerciseKeyStateModel = {
  exerciseKeys: [],
  paginatedExerciseKeys: {},
  lastPage: null,
  exerciseKeysSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  exerciseKeyFormId: null,
  exerciseKeyFormRecord: emptyExerciseKeyFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ExerciseKeyFormCloseURL =
  'dashboard?adminSection=Institutions&tab=ExerciseKeys';
