import {
  FetchPolicy,
  Assignment,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';

export const emptyAssignmentFormRecord: Assignment = {
  id: null,
  title: null,
  instructions: null,
  course: null,
};
export interface AssignmentStateModel {
  assignments: Assignment[];
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  assignmentFormId: number;
  assignmentFormRecord: Assignment;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultAssignmentState: AssignmentStateModel = {
  assignments: [],
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  assignmentFormId: null,
  assignmentFormRecord: emptyAssignmentFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const AssignmentFormCloseURL =
  'dashboard?adminSection=Institutions&tab=Assignments';
