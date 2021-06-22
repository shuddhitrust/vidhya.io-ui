import { INSTITUTIONS } from 'src/app/pages/static/dashboard/tabs/admin-dashboard/admin-dashboard.component';
import { defaultLogos } from '../../common/constants';
import {
  FetchPolicy,
  Institution,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

export const emptyInstitutionFormRecord: Institution = {
  id: null,
  name: null,
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
  fetchedOnce: boolean;
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  institutionFormId: number;
  institutionFormRecord: Institution;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultInstitutionState: InstitutionStateModel = {
  institutions: [],
  fetchedOnce: false,
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  institutionFormId: null,
  institutionFormRecord: emptyInstitutionFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const InstitutionFormCloseURL =
  uiroutes.DASHBOARD_ROUTE + '?adminSection=' + INSTITUTIONS;
