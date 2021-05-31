import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchCoursesAction {
  static readonly type = '[COURSES] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class ForceRefetchCoursesAction {
  static readonly type = '[COURSES] Fetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class GetCourseAction {
  static readonly type = '[COURSE] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateCourseAction {
  static readonly type = '[COURSE] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
    }
  ) {}
}

export class ResetCourseFormAction {
  static readonly type = '[COURSE] Reset Form';

  constructor() {}
}

export class DeleteCourseAction {
  static readonly type = '[COURSE] Delete';

  constructor(public payload: idPayload) {}
}
