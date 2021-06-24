import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchUserRolesAction {
  static readonly type = '[ROLES] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class UserRoleSubscriptionAction {
  static readonly type = '[ROLES] Subscribe';

  constructor() {}
}
export class ForceRefetchUserRolesAction {
  static readonly type = '[ROLES] Fetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class GetUserRoleAction {
  static readonly type = '[ROLE] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateUserRoleAction {
  static readonly type = '[ROLE] Create';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class ResetUserRoleFormAction {
  static readonly type = '[ROLE] Reset Form';

  constructor() {}
}

export class DeleteUserRoleAction {
  static readonly type = '[ROLE] Delete';

  constructor(public payload: idPayload) {}
}
