import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchAssignmentsAction {
  static readonly type = '[ASSIGNMENTS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class AssignmentSubscriptionAction {
  static readonly type = '[ASSIGNMENTS] Subscribe';

  constructor() {}
}

export class ForceRefetchAssignmentsAction {
  static readonly type = '[ASSIGNMENTS] Fetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class GetAssignmentAction {
  static readonly type = '[ASSIGNMENT] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateAssignmentAction {
  static readonly type = '[ASSIGNMENT] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
    }
  ) {}
}

export class ResetAssignmentFormAction {
  static readonly type = '[ASSIGNMENT] Reset Form';

  constructor() {}
}

export class DeleteAssignmentAction {
  static readonly type = '[ASSIGNMENT] Delete';

  constructor(public payload: idPayload) {}
}
