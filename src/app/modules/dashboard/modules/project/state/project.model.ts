import { PROJECT_TAB_LABEL } from 'src/app/modules/public/components/profiles/public-user-profile/public-user-profile.component';
import {
  FetchParams,
  FetchPolicyModel,
  Project,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';

export const emptyProjectFormRecord: Project = {
  id: null,
  title: null,
  author: null,
  link: null,
  course: null,
  description: null,
  public: true,
};
export interface ProjectStateModel {
  projects: Project[];
  paginatedProjects: any;
  lastPage: number;
  projectsSubscribed: boolean;
  fetchPolicy: FetchPolicyModel;
  fetchParamObjects: FetchParams[];
  projectFormId: number;
  projectFormRecord: Project;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultProjectState: ProjectStateModel = {
  projects: [],
  paginatedProjects: {},
  lastPage: null,
  projectsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  projectFormId: null,
  projectFormRecord: emptyProjectFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const ProjectFormCloseURL = (username) => {
  return (
    uiroutes.MEMBER_PROFILE_ROUTE.route +
    '/' +
    username +
    '?tab=' +
    PROJECT_TAB_LABEL
  );
};
