import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload, IndexListType } from '../../common/models';

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

export class ResetExerciseStateAction {
  static readonly type = '[EXERCISE] Reset State';

  constructor() {}
}

export class DeleteExerciseAction {
  static readonly type = '[EXERCISE] Delete';

  constructor(public payload: idPayload) {}
}

export class ReorderExercisesAction {
  static readonly type = '[EXERCISES] Reorder';

  constructor(public payload: { indexList: IndexListType[] }) {}
}
