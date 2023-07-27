import {
  ADMIN_SECTION_LABELS,
  defaultLogos,
} from '../../../../../../../../shared/common/constants';
import {
  FetchPolicyModel,
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
  institutionType:null,
  designations:null,
  coordinator:{id:null,name:null,email:null,mobile:null},
  verified:false,
  public:false,
  author:null,
  address:null,
};
export interface InstitutionStateModel {
  institutions: Institution[];
  institutionsSubscribed: boolean;
  fetchPolicy: FetchPolicyModel;
  fetchParamObjects: FetchParams[];
  institutionFormId: number;
  institutionFormRecord: Institution;
  institutionModalData:Institution;
  isInstitutionModalFormOpen:boolean;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export interface fetchDesignationByInstitutionModel {
  id:null,
  name:string,
  institutionType:null,
  designations:null, 
}

export const defaultInstitutionState: InstitutionStateModel = {
  institutions: [],
  institutionsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  institutionFormId: null,
  institutionFormRecord: emptyInstitutionFormRecord,
  institutionModalData: null,
  isInstitutionModalFormOpen:false,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const InstitutionFormCloseURL = uiroutes.DASHBOARD_ROUTE.route;
