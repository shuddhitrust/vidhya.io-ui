import { FetchPolicy, Group, User } from '../../common/models';

export interface OptionsStateModel {
  membersByInstitution: User[];
  memberInstitutionId: string;
  isFetchingMembersByInstitution: boolean;
  fetchPolicyForMembers: FetchPolicy;
  adminGroups: Group[];
  isFetchingAdminGroups: boolean;
  fetchPolicyForGroups: FetchPolicy;
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
