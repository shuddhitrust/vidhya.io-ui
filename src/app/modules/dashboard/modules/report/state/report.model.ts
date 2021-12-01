import {
  FetchParams,
  FetchPolicyModel,
  Report,
} from 'src/app/shared/common/models';

export const emptyReportFormRecord: Report = {
  id: null,
  participant: null,
  course: null,
  institution: null,
  completed: null,
  percentage: null,
};
export interface ReportStateModel {
  reports: Report[];
  lastPage: number;
  reportsSubscribed: boolean;
  fetchPolicy: FetchPolicyModel;
  fetchParamObjects: FetchParams[];
  reportFormId: number;
  reportFormRecord: Report;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultReportState: ReportStateModel = {
  reports: [],
  lastPage: null,
  reportsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  reportFormId: null,
  reportFormRecord: emptyReportFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};
