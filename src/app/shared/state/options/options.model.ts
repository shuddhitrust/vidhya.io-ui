import { FetchPolicyModel, Group, User, Institution, FetchParams } from '../../common/models';

export interface OptionsStateModel {
  membersByInstitution: User[];
  graders: User[];
  memberInstitutionId: string;
  isFetchingMembersByInstitution: boolean;
  isFetchingAllInstitutions: boolean;
  isFetchingGraders: boolean;
  isFetchingCoordinators:boolean;
  fetchPolicyForMembers: FetchPolicyModel;
  fetchParamObjects: FetchParams[];
  adminGroups: Group[];
  institutionsList : Institution[];
  institutionCoordiatorMembers:User[];
  isFetchingDesignationsByInsitution: boolean;
  designationsByInsitution: Institution[];
  isFetchingAdminGroups: boolean;
  fetchPolicyForGroups: FetchPolicyModel;
}

export const defaultOptionsState: OptionsStateModel = {
  membersByInstitution: [],
  institutionCoordiatorMembers:[],
  fetchParamObjects: [],
  graders: [],
  memberInstitutionId: null,
  isFetchingMembersByInstitution: false,
  isFetchingAllInstitutions: false,
  isFetchingGraders: false,
  isFetchingCoordinators:false,
  fetchPolicyForMembers: null,
  adminGroups: [],
  institutionsList: [],
  isFetchingDesignationsByInsitution:false,
  designationsByInsitution:[],
  isFetchingAdminGroups: false,
  fetchPolicyForGroups: null,
};
