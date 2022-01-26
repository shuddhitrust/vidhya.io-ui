import { idPayload } from 'src/app/shared/common/models';
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

export class FetchPublicInstitutionssAction {
  static readonly type = '[PUBLIC] Public Fetch Institutions';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextPublicInstitutionsAction {
  static readonly type = '[PUBLIC] Fetch Next Institutions';

  constructor() {}
}

export class FetchNewsAction {
  static readonly type = '[PUBLIC] Fetch News';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class ForceRefetchNewsAction {
  static readonly type = '[PUBLIC] Force Fetch News';

  constructor() {}
}

export class FetchNextNewsAction {
  static readonly type = '[PUBLIC] Fetch Next News';

  constructor() {}
}

export class GetNewsAction {
  static readonly type = '[PUBLIC] Get News';

  constructor(public payload: { id: number }) {}
}

export class GetPublicInstitutionAction {
  static readonly type = '[PUBLIC] Get Institution';

  constructor(public payload: { code: string }) {}
}

export class ResetNewsProfileAction {
  static readonly type = '[PUBLIC] Reset News Profile';

  constructor() {}
}

export class ResetPublicInstitutionFormAction {
  static readonly type = '[PUBLIC] Reset Institution Profile';

  constructor() {}
}

export class ResetPublicHomePageListsAction {
  static readonly type = '[PUBLIC] Reset Homepage data';

  constructor() {}
}
