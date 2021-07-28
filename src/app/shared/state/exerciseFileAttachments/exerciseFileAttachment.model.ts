import {
  FetchPolicy,
  ExerciseFileAttachment,
  FetchParams,
  startingFetchParams,
} from '../../common/models';

export const emptyExerciseFileAttachmentFormRecord: ExerciseFileAttachment = {
  id: null,
  title: null,
  author: null,
  message: null,
  institution: null,
  groups: [],
};
export interface ExerciseFileAttachmentStateModel {
  exerciseFileAttachments: ExerciseFileAttachment[];
  lastPage: number;
  exerciseFileAttachmentsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  exerciseFileAttachmentFormId: number;
  exerciseFileAttachmentFormRecord: ExerciseFileAttachment;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultExerciseFileAttachmentState: ExerciseFileAttachmentStateModel = {
  exerciseFileAttachments: [],
  lastPage: null,
  exerciseFileAttachmentsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  exerciseFileAttachmentFormId: null,
  exerciseFileAttachmentFormRecord: emptyExerciseFileAttachmentFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ExerciseFileAttachmentFormCloseURL =
  'dashboard?adminSection=Institutions&tab=ExerciseFileAttachments';
