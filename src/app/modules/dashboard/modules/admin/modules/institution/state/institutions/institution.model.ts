import {
  ADMIN_SECTION_LABELS,
  defaultLogos,
} from '../../../../../../../../shared/common/constants';
import {
  FetchPolicy,
  Institution,
  FetchParams,
} from '../../../../../../../../shared/common/models';
import { uiroutes } from '../../../../../../../../shared/common/ui-routes';

export const emptyInstitutionFormRecord: Institution = {
  id: null,
  name: null,
  code: null,
  location: null,
  city: null,
  website: null,
  phone: null,
  logo: defaultLogos.institution,
  bio: null,
  invitecode: null,
};
export interface InstitutionStateModel {
  institutions: Institution[];
  institutionsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  institutionFormId: number;
  institutionFormRecord: Institution;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultInstitutionState: InstitutionStateModel = {
  institutions: [],
  institutionsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  institutionFormId: null,
  institutionFormRecord: emptyInstitutionFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const InstitutionFormCloseURL =
  uiroutes.DASHBOARD_ROUTE.route +
  '?adminSection=' +
  ADMIN_SECTION_LABELS.INSTITUTIONS;
