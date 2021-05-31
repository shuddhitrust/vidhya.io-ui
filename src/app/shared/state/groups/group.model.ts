import { autoGenOptions } from '../../common/functions';
import {
  FetchPolicy,
  Group,
  GroupType,
  MatSelectOption,
  PaginationObject,
  startingPaginationObject,
} from '../../common/models';

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
  fetchPolicy: null,
  paginationObject: startingPaginationObject,
  groupFormId: null,
  groupFormRecord: emptyGroupFormRecord,
  isFetching: false,
  errorFetching: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const GroupFormCloseURL =
  'dashboard?adminSection=Institutions&tab=Groups';

export const groupTypeOptions: MatSelectOption[] = autoGenOptions(GroupType);
