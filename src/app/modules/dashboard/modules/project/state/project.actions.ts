import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { idPayload } from 'src/app/shared/common/models';

export class FetchProjectsAction {
  static readonly type = '[PROJECTS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextProjectsAction {
  static readonly type = '[PROJECTS] Fetch Next';

  constructor() {}
}

export class ProjectSubscriptionAction {
  static readonly type = '[PROJECTS] Subscribe';

  constructor() {}
}

export class ForceRefetchProjectsAction {
  static readonly type = '[PROJECTS] Fetch from network';

  constructor() {}
}

export class GetProjectAction {
  static readonly type = '[PROJECT] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateProjectAction {
  static readonly type = '[PROJECT] Create';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class ResetProjectFormAction {
  static readonly type = '[PROJECT] Reset Form';

  constructor() {}
}

export class DeleteProjectAction {
  static readonly type = '[PROJECT] Delete';

  constructor(public payload: idPayload) {}
}
