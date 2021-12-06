import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { idPayload } from 'src/app/shared/common/models';

export class FetchCoursesAction {
  static readonly type = '[COURSES] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextCoursesAction {
  static readonly type = '[COURSES] Fetch Next';

  constructor() {}
}

export class CourseSubscriptionAction {
  static readonly type = '[COURSES] Subscribe';

  constructor() {}
}

export class ForceRefetchCoursesAction {
  static readonly type = '[COURSES] Fetch from network';

  constructor() {}
}

export class GetCourseAction {
  static readonly type = '[COURSE] Get';

  constructor(public payload: { id: number; fetchFormDetails: boolean }) {}
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

export class PublishCourseAction {
  static readonly type = '[COURSE] Publish';

  constructor(public payload: { id: number; publishChapters: boolean }) {}
}
