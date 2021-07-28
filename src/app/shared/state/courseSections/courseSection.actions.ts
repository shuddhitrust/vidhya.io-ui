import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchCourseSectionsAction {
  static readonly type = '[COURSE SECTIONS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextCourseSectionsAction {
  static readonly type = '[COURSE SECTIONS] Fetch Next';

  constructor() {}
}

export class CourseSectionSubscriptionAction {
  static readonly type = '[COURSE SECTIONS] Subscribe';

  constructor() {}
}

export class ForceRefetchCourseSectionsAction {
  static readonly type = '[COURSE SECTIONS] Fetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class GetCourseSectionAction {
  static readonly type = '[COURSE SECTION] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateCourseSectionAction {
  static readonly type = '[COURSE SECTION] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
    }
  ) {}
}

export class ResetCourseSectionFormAction {
  static readonly type = '[COURSE SECTION] Reset Form';

  constructor() {}
}

export class DeleteCourseSectionAction {
  static readonly type = '[COURSE SECTION] Delete';

  constructor(public payload: idPayload) {}
}
