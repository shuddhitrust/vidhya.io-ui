import { SearchParams } from '../../abstract/master-grid/table.model';
import {
  FetchPolicy,
  Chapter,
  FetchParams,
  startingFetchParams,
  CourseStatusOptions,
} from '../../common/models';

export type Assignment = {
  id: number;
  exercisesCount: number;
  submittedCount: number;
  gradedCount: number;
  title: string;
  subtitle: string;
  pointsScored: number;
  totalPoints: number;
};

export const emptyChapterFormRecord: Chapter = {
  id: null,
  title: null,
  instructions: null,
  course: null,
  status: 'DR',
};
export interface ChapterStateModel {
  chapters: Chapter[];
  paginatedChapters: any;
  lastPage: number;
  assignments: Assignment[];
  paginatedAssignments: any;
  assignmentsLastPage: number;
  chaptersSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  chapterFormId: number;
  chapterFormRecord: Chapter;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultChapterState: ChapterStateModel = {
  chapters: [],
  paginatedChapters: {},
  lastPage: null,
  assignments: [],
  paginatedAssignments: {},
  assignmentsLastPage: null,
  chaptersSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  chapterFormId: null,
  chapterFormRecord: emptyChapterFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};
