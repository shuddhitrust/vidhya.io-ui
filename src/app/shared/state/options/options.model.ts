import { FetchPolicyModel, Group, User, Institution } from '../../common/models';

export interface OptionsStateModel {
  membersByInstitution: User[];
  graders: User[];
  memberInstitutionId: string;
  isFetchingMembersByInstitution: boolean;
  isFetchingAllInstitutions: boolean;
  isFetchingGraders: boolean;
  fetchPolicyForMembers: FetchPolicyModel;
  adminGroups: Group[];
  institutionsList : Institution[];
  isFetchingDesignationsByInsitution: boolean;
  designationsByInsitution: Institution[];
  isFetchingAdminGroups: boolean;
  fetchPolicyForGroups: FetchPolicyModel;
}

export const defaultOptionsState: OptionsStateModel = {
  membersByInstitution: [],
  graders: [],
  memberInstitutionId: null,
  isFetchingMembersByInstitution: false,
  isFetchingAllInstitutions: false,
  isFetchingGraders: false,
  fetchPolicyForMembers: null,
  adminGroups: [],
  institutionsList: [],
  isFetchingDesignationsByInsitution:false,
  designationsByInsitution:[],
  isFetchingAdminGroups: false,
  fetchPolicyForGroups: null,
};
