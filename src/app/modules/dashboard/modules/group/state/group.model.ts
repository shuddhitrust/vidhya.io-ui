import { GROUPS } from 'src/app/modules/dashboard/dashboard.component';
import { defaultLogos } from 'src/app/shared/common/constants';
import { FetchParams, FetchPolicy, Group } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';

export const emptyGroupFormRecord: Group = {
  id: null,
  avatar: defaultLogos.group,
  name: null,
  description: null,
  institution: { id: null },
  members: [],
  admins: [],
  groupType: null,
};
export interface GroupStateModel {
  groups: Group[];
  paginatedGroups: any;
  lastPage: number;
  groupsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  fetchParamObjects: FetchParams[];
  groupFormId: number;
  groupFormRecord: Group;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultGroupState: GroupStateModel = {
  groups: [],
  paginatedGroups: {},
  lastPage: null,
  groupsSubscribed: false,
  fetchPolicy: null,
  fetchParamObjects: [],
  groupFormId: null,
  groupFormRecord: emptyGroupFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const GroupFormCloseURL =
  uiroutes.DASHBOARD_ROUTE.route + '?tab=' + GROUPS;
