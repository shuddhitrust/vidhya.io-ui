import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchMembersAction {
  static readonly type = '[MEMBERS] Fetch';

  constructor(public payload: { searchParams?: SearchParams }) {}
}

export class ForceRefetchMembersAction {
  static readonly type = '[MEMBERS] Fetch from network';

  constructor(public payload: { searchParams?: SearchParams }) {}
}

export class GetMemberAction {
  static readonly type = '[MEMBER] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateMemberAction {
  static readonly type = '[MEMBER] Create';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class ResetMemberFormAction {
  static readonly type = '[MEMBER] Reset Form';

  constructor() {}
}

export class DeleteMemberAction {
  static readonly type = '[MEMBER] Delete';

  constructor(public payload: idPayload) {}
}
