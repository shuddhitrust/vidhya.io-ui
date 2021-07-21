import {
  FetchPolicy,
  Assignment,
  FetchParams,
  startingFetchParams,
} from '../../common/models';

export const emptyAssignmentFormRecord: Assignment = {
  id: null,
  title: null,
  instructions: null,
  course: null,
};
export interface AssignmentStateModel {
  assignments: Assignment[];
  lastPage: number;
  assignmentsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamss: FetchParams[];
  assignmentFormId: number;
  assignmentFormRecord: Assignment;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultAssignmentState: AssignmentStateModel = {
  assignments: [],
  lastPage: null,
  assignmentsSubscribed: false,
  fetchPolicy: null,
  fetchParamss: [],
  assignmentFormId: null,
  assignmentFormRecord: emptyAssignmentFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const AssignmentFormCloseURL =
  'dashboard?adminSection=Institutions&tab=Assignments';
