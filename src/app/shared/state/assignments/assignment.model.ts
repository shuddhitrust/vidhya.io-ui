import { FetchPolicy, FetchParams } from '../../common/models';

export type Assignment = {
  id: number;
  title: string;
  course: string;
  section: string;
  status: string;
  dueDate: string;
  exercisesCount: number;
  submittedCount: number;
  percentage: number;
  gradedCount: number;
  pointsScored: number;
  totalPoints: number;
};

export interface AssignmentStateModel {
  assignments: Assignment[];
  paginatedAssignments: any;
  lastPage: number;
  assignmentsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  isFetching: boolean;
  errorFetching: boolean;
}

export const defaultAssignmentState: AssignmentStateModel = {
  assignments: [],
  paginatedAssignments: {},
  lastPage: null,
  assignmentsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  isFetching: false,
  errorFetching: false,
};
