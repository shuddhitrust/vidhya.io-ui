export class CreateGroupMember {
  static readonly type = '[GROUP_MEMBER] Create';

  constructor(public payload: { groupId: string; memberId: string }) {}
}

export class DeleteGroupMember {
  static readonly type = '[GROUP_MEMBER] Delete';

  constructor(public payload: { id: string }) {}
}

export class BulkCreateGroupMembers {
  static readonly type = '[GROUP_MEMBER] Bulk Create';

  constructor(public payload: { groupId: string; memberIds: string[] }) {}
}

export class BulkDeleteGroupMembers {
  static readonly type = '[GROUP_MEMBER] Bulk Delete';

  constructor(public payload: { groupId: string; memberIds: string[] }) {}
}

export class ResetBulkGroupMemberUpdateStatus {
  static readonly type = '[GROUP_MEMBER] Reset update statuses';

  constructor() {}
}
