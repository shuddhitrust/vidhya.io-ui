import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { ExerciseSubmission, idPayload } from 'src/app/shared/common/models';

export class FetchExerciseSubmissionsAction {
  static readonly type = '[EXERCISE_SUBMISSIONS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextExerciseSubmissionsAction {
  static readonly type = '[EXERCISE_SUBMISSIONS] Fetch Next';

  constructor() {}
}

export class FetchGradingGroupsAction {
  static readonly type = '[EXERCISE_SUBMISSION_GROUPS] Fetch';

  constructor(public payload: { searchParams: SearchParams }) {}
}

export class FetchNextGradingGroupsAction {
  static readonly type = '[EXERCISE_SUBMISSION_GROUPS] Fetch Next';

  constructor() {}
}

export class ExerciseSubmissionSubscriptionAction {
  static readonly type = '[EXERCISE_SUBMISSIONS] Subscribe';

  constructor() {}
}

export class ForceRefetchExerciseSubmissionsAction {
  static readonly type = '[EXERCISE_SUBMISSIONS] Fetch from network';

  constructor() {}
}

export class GetExerciseSubmissionAction {
  static readonly type = '[EXERCISE_SUBMISSION] Get';

  constructor(public payload: idPayload) {}
}

export class CreateUpdateExerciseSubmissionsAction {
  static readonly type = '[EXERCISE_SUBMISSION] Create';

  constructor(
    public payload: {
      exerciseSubmissions: ExerciseSubmission[];
      grading: boolean;
      bulkauto?: boolean;
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

export class ShowSubmissionHistory {
  static readonly type = '[EXERCISE_SUBMISSION] Show history';

  constructor(public payload: { exerciseId: number; participantId: number }) {}
}

export class ResetSubmissionHistory {
  static readonly type = '[EXERCISE_SUBMISSION] Reset history';

  constructor() {}
}

export class BulkSanitizeSubmissionRubricAction {
  static readonly type = '[EXERCISE_SUBMISSION] Bulk Sanitize Rubric';

  constructor() {}
}

export class BulkUpdateSanitizedRubricAction {
  static readonly type = '[EXERCISE_SUBMISSION] Bulk Update Sanitize Rubric';

  constructor(public payload: { submissionList: any[] }) {}
}
