import { FormGroup, FormGroupDirective } from '@angular/forms';
import { SearchParams } from '../../abstract/master-grid/table.model';
import { idPayload } from '../../common/models';

export class FetchExerciseFileAttachmentsAction {
  static readonly type = '[EXERCISE_FILE_ATTACHMENTS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextExerciseFileAttachmentsAction {
  static readonly type = '[EXERCISE_FILE_ATTACHMENTS] Fetch Next';

  constructor() {}
}

export class ExerciseFileAttachmentSubscriptionAction {
  static readonly type = '[EXERCISE_FILE_ATTACHMENTS] Subscribe';

  constructor() {}
}

export class ForceRefetchExerciseFileAttachmentsAction {
  static readonly type = '[EXERCISE_FILE_ATTACHMENTS] Fetch from network';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class GetExerciseFileAttachmentAction {
  static readonly type = '[EXERCISE_FILE_ATTACHMENT] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateExerciseFileAttachmentAction {
  static readonly type = '[EXERCISE_FILE_ATTACHMENT] Create';

  constructor(
    public payload: {
      form: FormGroup;
      formDirective: FormGroupDirective;
    }
  ) {}
}

export class ResetExerciseFileAttachmentFormAction {
  static readonly type = '[EXERCISE_FILE_ATTACHMENT] Reset Form';

  constructor() {}
}

export class DeleteExerciseFileAttachmentAction {
  static readonly type = '[EXERCISE_FILE_ATTACHMENT] Delete';

  constructor(public payload: idPayload) {}
}
