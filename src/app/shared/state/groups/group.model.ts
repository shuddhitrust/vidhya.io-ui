import { autoGenOptions } from '../../common/functions';
import {
  FetchPolicy,
  Group,
  GroupType,
  MatSelectOption,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';
import { uiroutes } from '../../common/ui-routes';
import { GROUPS } from './../../../pages/static/dashboard/dashboard.component';

export const emptyGroupFormRecord: Group = {
  id: null,
  name: null,
  description: null,
  institution: { id: null },
  members: [],
  admins: [],
  groupType: null,
};
export interface GroupStateModel {
  groups: Group[];
  groupsSubscribed: boolean;
  fetchPolicy: FetchPolicy;
  paginationObject: PaginationObject;
  groupFormId: number;
  groupFormRecord: Group;
  isFetching: boolean;
  errorFetching: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultGroupState: GroupStateModel = {
  groups: [],
  groupsSubscribed: false,
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  groupFormId: null,
  groupFormRecord: emptyGroupFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const GroupFormCloseURL = uiroutes.DASHBOARD_ROUTE + '?tab=' + GROUPS;

export const groupTypeOptions: MatSelectOption[] = autoGenOptions(GroupType);
