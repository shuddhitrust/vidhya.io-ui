import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchMembersAction {
  static readonly type = '[MEMBERS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchPublicMembersAction {
  static readonly type = '[MEMBERS] Public Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextPublicMembersAction {
  static readonly type = '[MEMBERS] Fetch Next';

  constructor() {}
}

export class MemberSubscriptionAction {
  static readonly type = '[MEMBER] Subscribe';

  constructor() {}
}

export class ForceRefetchMembersAction {
  static readonly type = '[MEMBERS] Fetch from network';

  constructor() {}
}

export class GetMemberAction {
  static readonly type = '[MEMBER] Get';

  constructor(public payload: idPayload) {}
}

export class GetMemberByUsernameAction {
  static readonly type = '[MEMBER] Get by username';

  constructor(public payload: { username: string }) {}
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

export class ApproveMemberAction {
  static readonly type = '[MEMBER] Approve';

  constructor(public payload: { userId: number; roleName: string }) {}
}

export class SuspendMemberAction {
  static readonly type = '[MEMBER] Suspend';

  constructor(public payload: { userId: number; remarks: string }) {}
}
