import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchGroupsAction {
  static readonly type = '[GROUPS] Fetch';

  constructor(public payload: { searchParams?: SearchParams }) {}
}

export class ForceRefetchGroupsAction {
  static readonly type = '[GROUPS] Fetch from network';

  constructor(public payload: { searchParams?: SearchParams }) {}
}

export class GetGroupAction {
  static readonly type = '[GROUP] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateGroupAction {
  static readonly type = '[GROUP] Create';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class ResetGroupFormAction {
  static readonly type = '[GROUP] Reset Form';

  constructor() {}
}

export class DeleteGroupAction {
  static readonly type = '[GROUP] Delete';

  constructor(public payload: idPayload) {}
}
