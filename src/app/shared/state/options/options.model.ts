import { FetchPolicyModel, Group, User } from '../../common/models';

export interface OptionsStateModel {
  membersByInstitution: User[];
  memberInstitutionId: string;
  isFetchingMembersByInstitution: boolean;
  fetchPolicyForMembers: FetchPolicyModel;
  adminGroups: Group[];
  isFetchingAdminGroups: boolean;
  fetchPolicyForGroups: FetchPolicyModel;
}

export const defaultOptionsState: OptionsStateModel = {
  membersByInstitution: [],
  memberInstitutionId: null,
  isFetchingMembersByInstitution: false,
  fetchPolicyForMembers: null,
  adminGroups: [],
  isFetchingAdminGroups: false,
  fetchPolicyForGroups: null,
};
