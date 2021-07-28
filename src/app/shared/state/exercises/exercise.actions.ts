import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchExercisesAction {
  static readonly type = '[EXERCISES] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextExercisesAction {
  static readonly type = '[EXERCISES] Fetch Next';

  constructor() {}
}

export class ExerciseSubscriptionAction {
  static readonly type = '[EXERCISES] Subscribe';

  constructor() {}
}

export class ForceRefetchExercisesAction {
  static readonly type = '[EXERCISES] Fetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class GetExerciseAction {
  static readonly type = '[EXERCISE] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateExerciseAction {
  static readonly type = '[EXERCISE] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
    }
  ) {}
}

export class ResetExerciseFormAction {
  static readonly type = '[EXERCISE] Reset Form';

  constructor() {}
}

export class DeleteExerciseAction {
  static readonly type = '[EXERCISE] Delete';

  constructor(public payload: idPayload) {}
}
