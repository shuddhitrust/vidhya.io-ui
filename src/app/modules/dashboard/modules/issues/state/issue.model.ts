import {
  FetchParams,
  FetchPolicyModel,
  Issue,
  IssueStatusTypeOptions,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';

export const emptyIssueFormRecord: Issue = {
  id: null,
  link: null,
  description: null,
  resourceId: null,
  resourceType: null,
  reporter: null,
  guestName: null,
  guestEmail: null,
  screenshot: null,
  status: 'PE',
  remarks: null,
};
export interface IssueStateModel {
  issues: Issue[];
  paginatedIssues: any;
  lastPage: number;
  issuesSubscribed: boolean;
  fetchPolicy: FetchPolicyModel;
  fetchParamObjects: FetchParams[];
  issueFormId: number;
  issueFormRecord: Issue;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultIssueState: IssueStateModel = {
  issues: [],
  paginatedIssues: {},
  lastPage: null,
  issuesSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  issueFormId: null,
  issueFormRecord: emptyIssueFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};
