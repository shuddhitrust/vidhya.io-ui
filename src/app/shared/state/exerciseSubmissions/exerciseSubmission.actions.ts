import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchExerciseSubmissionsAction {
  static readonly type = '[EXERCISE_SUBMISSIONS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextExerciseSubmissionsAction {
  static readonly type = '[EXERCISE_SUBMISSIONS] Fetch Next';

  constructor() {}
}

export class ExerciseSubmissionSubscriptionAction {
  static readonly type = '[EXERCISE_SUBMISSIONS] Subscribe';

  constructor() {}
}

export class ForceRefetchExerciseSubmissionsAction {
  static readonly type = '[EXERCISE_SUBMISSIONS] Fetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class GetExerciseSubmissionAction {
  static readonly type = '[EXERCISE_SUBMISSION] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateExerciseSubmissionAction {
  static readonly type = '[EXERCISE_SUBMISSION] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
    }
  ) {}
}

export class ResetExerciseSubmissionFormAction {
  static readonly type = '[EXERCISE_SUBMISSION] Reset Form';

  constructor() {}
}

export class DeleteExerciseSubmissionAction {
  static readonly type = '[EXERCISE_SUBMISSION] Delete';

  constructor(public payload: idPayload) {}
}
