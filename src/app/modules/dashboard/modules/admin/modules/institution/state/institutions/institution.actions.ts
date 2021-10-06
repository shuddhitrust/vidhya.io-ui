import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../../../../../../../shared/modules/master-grid/table.model';
import { idPayload } from '../../../../../../../../shared/common/models';

export class FetchInstitutionsAction {
  static readonly type = '[INSTITUTIONS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class InstitutionSubscriptionAction {
  static readonly type = '[INSTITUTIONS] Subscribe';

  constructor() {}
}

export class ForceRefetchInstitutionsAction {
  static readonly type = '[INSTITUTIONS] Fetch from network';

  constructor() {}
}

export class GetInstitutionAction {
  static readonly type = '[INSTITUTION] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateInstitutionAction {
  static readonly type = '[INSTITUTION] Create';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class ResetInstitutionFormAction {
  static readonly type = '[INSTITUTION] Reset Form';

  constructor() {}
}

export class DeleteInstitutionAction {
  static readonly type = '[INSTITUTION] Delete';

  constructor(public payload: idPayload) {}
}
