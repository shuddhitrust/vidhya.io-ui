import { SearchParams } from '../../../../shared/modules/master-grid/table.model';

export class FetchPublicMembersAction {
  static readonly type = '[PUBLIC] Public Fetch Members';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextPublicMembersAction {
  static readonly type = '[PUBLIC] Fetch Next Members';

  constructor() {}
}

export class GetMemberByUsernameAction {
  static readonly type = '[PUBLIC] Get Member by username';

  constructor(public payload: { username: string }) {}
}

export class ResetPublicMemberFormAction {
  static readonly type = '[PUBLIC] Reset Member Form';

  constructor() {}
}

export class ResetPublicHomePageListsAction {
  static readonly type = '[PUBLIC] Reset Homepage data';

  constructor() {}
}
