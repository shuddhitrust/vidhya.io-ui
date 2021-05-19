import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload, MatSelectOption, User } from '../../common/models';

export class FetchMembers {
  static readonly type = '[MEMBERS] Fetch';

  constructor(public payload: { searchParams?: SearchParams }) {}
}

export class ForceRefetchMembers {
  static readonly type = '[MEMBERS] Refetch from network';

  constructor(public payload: { searchParams?: SearchParams }) {}
}
export class GetMember {
  static readonly type = '[MEMBER] Get';

  constructor(public payload: idPayload) {}
}

export class ResetMemberForm {
  static readonly type = '[MEMBER] Reset Form';

  constructor() {}
}

export class CreateUpdateMember {
  static readonly type = '[MEMBER] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
      institutionOptions: MatSelectOption[];
    }
  ) {}
}

export class DeleteMember {
  static readonly type = '[MEMBER] Delete';

  constructor(public payload: idPayload) {}
}

export class SetMemberFormRecord {
  static readonly type = '[MEMBER] Set member form record';

  constructor(public payload: User) {}
}

export class FetchMemberOptionsByInstitution {
  static readonly type = '[MEMBER] Fetch members by institution';

  constructor(public payload: { memberInstitutionId: string }) {}
}
