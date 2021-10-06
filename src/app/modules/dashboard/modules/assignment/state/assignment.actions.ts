import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';

export class FetchAssignmentsAction {
  static readonly type = '[ASSIGNMENTS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextAssignmentsAction {
  static readonly type = '[ASSIGNMENTS] Fetch Next';

  constructor() {}
}

export class ForceRefetchAssignmentsAction {
  static readonly type = '[ASSIGNMENTS] Force Refetch';

  constructor() {}
}
