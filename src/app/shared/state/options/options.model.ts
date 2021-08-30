import { FetchPolicy, Group, User } from '../../common/models';

export interface OptionsStateModel {
  membersByInstitution: User[];
  memberInstitutionId: string;
  isFetchingMembersByInstitution: boolean;
  fetchPolicyForMembers: FetchPolicy;
  groupsByInstitution: Group[];
  groupInstitutionId: string;
  isFetchingGroupsByInstitution: boolean;
  fetchPolicyForGroups: FetchPolicy;
}

export const defaultOptionsState: OptionsStateModel = {
  membersByInstitution: [],
  memberInstitutionId: null,
  isFetchingMembersByInstitution: false,
  fetchPolicyForMembers: null,
  groupsByInstitution: [],
  groupInstitutionId: null,
  isFetchingGroupsByInstitution: false,
  fetchPolicyForGroups: null,
};
