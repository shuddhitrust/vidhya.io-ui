import { CreateGroupMemberInput } from '../../common/models';

export const emptyGroupMemberFormRecord: CreateGroupMemberInput = {
  id: null,
  groupMemberGroupId: null,
  groupMemberMemberId: null,
};

export interface GroupMemberStateModel {
  groupId: string;
  memberId: string;
  memberIdsToAdd: string[];
  memberIdsToDelete: string[];
  bulkAddingGroupMembersSuccessful: boolean;
  bulkDeletingGroupMembersSuccessful: boolean;
  addingGroupMembers: boolean;
  deletingGroupMembers: boolean;
  isAddingGroupMember: boolean;
  createGroupMemberResponse: any;
}

export const defaultGroupMemberState: GroupMemberStateModel = {
  groupId: null,
  memberId: null,
  memberIdsToAdd: [],
  memberIdsToDelete: [],
  bulkAddingGroupMembersSuccessful: false,
  bulkDeletingGroupMembersSuccessful: false,
  addingGroupMembers: false,
  deletingGroupMembers: false,
  isAddingGroupMember: false,
  createGroupMemberResponse: null,
};
