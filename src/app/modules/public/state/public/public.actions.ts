import { SearchParams } from '../../../../shared/modules/master-grid/table.model';

export class FetchPublicMembersAction {
  static readonly type = '[MEMBERS] Public Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextPublicMembersAction {
  static readonly type = '[MEMBERS] Fetch Next';

  constructor() {}
}

export class GetMemberByUsernameAction {
  static readonly type = '[MEMBER] Get by username';

  constructor(public payload: { username: string }) {}
}
