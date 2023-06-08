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
  isFetchingAdminGroups: false,
  fetchPolicyForGroups: null,
};
