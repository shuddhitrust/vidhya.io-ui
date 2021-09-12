import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

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
