import { FetchPolicy, User } from '../../common/models';

export interface OptionsStateModel {
  membersByInstitution: User[];
  memberInstitutionId: string;
  isFetchingMembersByInstitution: boolean;
  fetchPolicyForMembers: FetchPolicy;
  groupsByInstitution: User[];
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
