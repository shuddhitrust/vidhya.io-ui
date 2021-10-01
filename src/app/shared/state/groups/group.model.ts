import { GROUPS } from 'src/app/modules/dashboard/dashboard.component';
import { defaultLogos } from '../../common/constants';
import { autoGenOptions } from '../../common/functions';
import {
  FetchPolicy,
  Group,
  GroupTypeOptions,
  MatSelectOption,
  FetchParams,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';

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

export const groupTypeOptions: MatSelectOption[] =
  autoGenOptions(GroupTypeOptions);
