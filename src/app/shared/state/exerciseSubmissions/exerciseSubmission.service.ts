import { Injectable } from '@angular/core';
import { ExerciseSubmission } from '../../common/models';
import { emptyExerciseSubmissionFormRecord } from './exerciseSubmission.model';

@Injectable({
  providedIn: 'root',
})
export class ExerciseSubmissionService {
  constructor() {}

  public sanitizeExerciseSubmissions = (
    submissions: ExerciseSubmission[]
  ): ExerciseSubmission[] => {
    console.log('parsing exercise submissions', { submissions });
    const newSubmissions = submissions.map((s) => {
      let submission: ExerciseSubmission = Object.assign(
        {},
        emptyExerciseSubmissionFormRecord
      );
      submission.id = s.id;
      submission.exercise = s.exercise?.id;
      submission.chapter = s.exercise?.chapter?.id;
      submission.course = s.exercise?.course?.id;
      submission.participant = s.participant?.id;
      submission.answer = s.answer;
      submission.option = s.option;
      submission.images = s.images;
      submission.link = s.link;
      submission.points = s.points;
      submission.status = s.status;
      submission.remarks = s.remarks;
      return submission;
    });
    console.log('after sanitizing ', { newSubmissions });
    return newSubmissions;
  };
}
