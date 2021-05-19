import { FormGroup, FormGroupDirective } from '@angular/forms';
import { idPayload } from '../../common/models';

export class FetchGroups {
  static readonly type = '[GROUPS] Fetch';

  constructor() {}
}

export class ForceRefetchGroups {
  static readonly type = '[GROUPS] Refetch from network';

  constructor() {}
}
export class GetGroup {
  static readonly type = '[GROUP] Get';

  constructor(public payload: idPayload) {}
}

export class ResetGroupForm {
  static readonly type = '[GROUP] Reset Form';

  constructor() {}
}
export class CreateUpdateGroup {
  static readonly type = '[GROUP] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
      addMemberIds: string[];
      removeMemberIds: string[];
    }
  ) {}
}

export class DeleteGroup {
  static readonly type = '[GROUP] Delete';

  constructor(public payload: idPayload) {}
}
