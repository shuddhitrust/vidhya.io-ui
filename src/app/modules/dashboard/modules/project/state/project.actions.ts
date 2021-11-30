import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { idPayload } from 'src/app/shared/common/models';

export class FetchProjectsAction {
  static readonly type = '[GROUPS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextProjectsAction {
  static readonly type = '[GROUPS] Fetch Next';

  constructor() {}
}

export class ProjectSubscriptionAction {
  static readonly type = '[GROUPS] Subscribe';

  constructor() {}
}

export class ForceRefetchProjectsAction {
  static readonly type = '[GROUPS] Fetch from network';

  constructor() {}
}

export class GetProjectAction {
  static readonly type = '[GROUP] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateProjectAction {
  static readonly type = '[GROUP] Create';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class ResetProjectFormAction {
  static readonly type = '[GROUP] Reset Form';

  constructor() {}
}

export class DeleteProjectAction {
  static readonly type = '[GROUP] Delete';

  constructor(public payload: idPayload) {}
}
