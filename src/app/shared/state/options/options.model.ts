import { FetchPolicyModel, Group, User } from '../../common/models';

export interface OptionsStateModel {
  membersByInstitution: User[];
  graders: User[];
  memberInstitutionId: string;
  isFetchingMembersByInstitution: boolean;
  isFetchingGraders: boolean;
  fetchPolicyForMembers: FetchPolicyModel;
  adminGroups: Group[];
  isFetchingAdminGroups: boolean;
  fetchPolicyForGroups: FetchPolicyModel;
}

export const defaultOptionsState: OptionsStateModel = {
  membersByInstitution: [],
  graders: [],
  memberInstitutionId: null,
  isFetchingMembersByInstitution: false,
  isFetchingGraders: false,
  fetchPolicyForMembers: null,
  adminGroups: [],
  isFetchingAdminGroups: false,
  fetchPolicyForGroups: null,
};
