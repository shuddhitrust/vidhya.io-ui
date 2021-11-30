import { GROUPS } from 'src/app/modules/dashboard/dashboard.component';
import { defaultLogos } from 'src/app/shared/common/constants';
import {
  FetchParams,
  FetchPolicyModel,
  Project,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';

export const emptyProjectFormRecord: Project = {
  id: null,
  avatar: defaultLogos.project,
  name: null,
  description: null,
  institution: { id: null },
  members: [],
  admins: [],
  projectType: null,
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

export const ProjectFormCloseURL =
  uiroutes.DASHBOARD_ROUTE.route + '?tab=' + GROUPS;
