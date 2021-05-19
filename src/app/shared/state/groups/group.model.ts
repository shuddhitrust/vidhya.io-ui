import { autoGenOptions } from '../../common/functions';
import {
  FetchPolicy,
  Group,
  GroupType,
  MatSelectOption,
} from '../../common/models';

export const emptyGroupFormRecord: Group = {
  __typename: 'Group',
  id: null,
  name: null,
  institution: null,
  type: null,
  description: null,
  // admins: null,
  // members: null,
  createdAt: null,
  updatedAt: null,
};

export interface GroupStateModel {
  groups: Group[];
  fetchPolicy: FetchPolicy;
  groupFormId: string;
  groupFormRecord: Group;
  isFetching: boolean;
  errorFetching: boolean;
  isFetchingFormRecord: boolean;
  errorFetchingFormRecord: boolean;
  formSubmitting: boolean;
  errorSubmitting: boolean;
}

export const defaultGroupState: GroupStateModel = {
  groups: [],
  fetchPolicy: null,
  groupFormId: null,
  groupFormRecord: emptyGroupFormRecord,
  isFetching: false,
  errorFetching: false,
  isFetchingFormRecord: false,
  errorFetchingFormRecord: false,
  formSubmitting: false,
  errorSubmitting: false,
};

export const groupTypeOptions: MatSelectOption[] = autoGenOptions(GroupType);
