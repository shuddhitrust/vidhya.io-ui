import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchReportsAction {
  static readonly type = '[REPORTS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextReportsAction {
  static readonly type = '[REPORTS] Fetch Next';

  constructor() {}
}

export class ReportSubscriptionAction {
  static readonly type = '[REPORTS] Subscribe';

  constructor() {}
}

export class ForceRefetchReportsAction {
  static readonly type = '[REPORTS] Fetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class GetReportAction {
  static readonly type = '[REPORT] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateReportAction {
  static readonly type = '[REPORT] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
    }
  ) {}
}

export class ResetReportFormAction {
  static readonly type = '[REPORT] Reset Form';

  constructor() {}
}

export class DeleteReportAction {
  static readonly type = '[REPORT] Delete';

  constructor(public payload: idPayload) {}
}
