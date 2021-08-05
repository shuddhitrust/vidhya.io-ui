import {
  FetchPolicy,
  Chapter,
  FetchParams,
  startingFetchParams,
} from '../../common/models';

export const emptyChapterFormRecord: Chapter = {
  id: null,
  title: null,
  instructions: null,
  course: null,
};
export interface ChapterStateModel {
  chapters: Chapter[];
  lastPage: number;
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
  lastPage: null,
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
