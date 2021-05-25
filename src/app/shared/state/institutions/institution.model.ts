import {
  FetchPolicy,
  Institution,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';

export const emptyInstitutionFormRecord: Institution = {
  __typename: 'Institution',
  id: null,
  name: null,
  location: null,
  city: null,
  website: null,
  phone: null,
  logo: null,
  bio: null,
  invitecode: null,
};
export interface InstitutionStateModel {
  institutions: Institution[];
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
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  institutionFormId: null,
  institutionFormRecord: emptyInstitutionFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};
