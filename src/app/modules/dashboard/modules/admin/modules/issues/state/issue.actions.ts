import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { idPayload } from 'src/app/shared/common/models';

export class FetchIssuesAction {
  static readonly type = '[ISSUES] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextIssuesAction {
  static readonly type = '[ISSUES] Fetch Next';

  constructor() {}
}

export class IssueSubscriptionAction {
  static readonly type = '[ISSUES] Subscribe';

  constructor() {}
}

export class ForceRefetchIssuesAction {
  static readonly type = '[ISSUES] Fetch from network';

  constructor() {}
}

export class GetIssueAction {
  static readonly type = '[ISSUE] Get';

  constructor(public payload: { id: number; fetchFormDetails: boolean }) {}
}

export class CreateUpdateIssueAction {
  static readonly type = '[ISSUE] Create';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class ResetIssueFormAction {
  static readonly type = '[ISSUE] Reset Form';

  constructor() {}
}

export class DeleteIssueAction {
  static readonly type = '[ISSUE] Delete';

  constructor(public payload: idPayload) {}
}
