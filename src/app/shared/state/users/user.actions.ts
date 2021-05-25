import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload, MatSelectOption, User } from '../../common/models';

export class FetchUsers {
  static readonly type = '[USERS] Fetch';

  constructor(public payload: { searchParams?: SearchParams }) {}
}

export class ForceRefetchUsers {
  static readonly type = '[USERS] Refetch from network';

  constructor(public payload: { searchParams?: SearchParams }) {}
}
export class GetUser {
  static readonly type = '[USER] Get';

  constructor(public payload: idPayload) {}
}

export class ResetUserForm {
  static readonly type = '[USER] Reset Form';

  constructor() {}
}

export class CreateUpdateUser {
  static readonly type = '[USER] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
      institutionOptions: MatSelectOption[];
    }
  ) {}
}

export class DeleteUser {
  static readonly type = '[USER] Delete';

  constructor(public payload: idPayload) {}
}

export class SetUserFormRecord {
  static readonly type = '[USER] Set user form record';

  constructor(public payload: User) {}
}

export class FetchUserOptionsByInstitution {
  static readonly type = '[USER] Fetch users by institution';

  constructor(public payload: { userInstitutionId: string }) {}
}
