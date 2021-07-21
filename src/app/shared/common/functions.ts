import {
  defaultResourcePermissions,
  MatSelectOption,
  FetchParams,
  SUBSCRIPTION_METHODS,
  User,
  UserPermissions,
} from './models';
import {
  day,
  defaultSearchParams,
  hour,
  minute,
  month,
  week,
  year,
} from './constants';

export const getOptionLabel = (
  value: string,
  options: MatSelectOption[]
): string => {
  const option = options.find((o) => o.value === value);
  if (option) {
    return option.label;
  } else return undefined;
};

export const subscriptionUpdater = ({
  items,
  method,
  subscriptionItem,
  fetchParamObjects,
}: {
  items: any[];
  method: string;
  subscriptionItem: any;
  fetchParamObjects: FetchParams[];
}) => {
  console.log('From SubscriptionUpdater method =>', {
    items,
    method,
    subscriptionItem,
    fetchParamObjects,
  });
  let fetchParams = fetchParamObjects[fetchParamObjects.length - 1];
  if (subscriptionItem && method) {
    if (method == SUBSCRIPTION_METHODS.CREATE_METHOD) {
      fetchParams = {
        ...fetchParams,
        totalCount: fetchParams.totalCount + 1,
      };
      items = [subscriptionItem, ...items];
    } else if (method == SUBSCRIPTION_METHODS.UPDATE_METHOD) {
      items = items.map((i) =>
        i.id == subscriptionItem.id ? subscriptionItem : i
      );
    } else if (method == SUBSCRIPTION_METHODS.DELETE_METHOD) {
      items = items.filter((i) => i.id != subscriptionItem.id);
      fetchParams = {
        ...fetchParams,
        totalCount: fetchParams.totalCount - 1,
      };
    }
  }
  const newFetchParamss = fetchParamObjects.concat([fetchParams]);
  console.log('After updating items =>', { items, fetchParams });
  return { items, fetchParamObjects: newFetchParamss };
};

export const fetchParamsNewOrNot = ({
  fetchParamObjects,
  newFetchParams,
}: {
  fetchParamObjects: FetchParams[];
  newFetchParams: FetchParams;
}): boolean => {
  console.log('from fetchParamsNewOrNot', {
    fetchParamObjects,
    newFetchParams,
  });
  let result = false;
  if (fetchParamObjects.length < 1) {
    return true;
  }
  for (let i = 0; i < fetchParamObjects.length; i++) {
    const fetchParams = fetchParamObjects[i];
    if (
      fetchParams.currentPage != newFetchParams.currentPage ||
      fetchParams.pageSize != newFetchParams.pageSize ||
      fetchParams.offset != newFetchParams.offset ||
      fetchParams.searchQuery != newFetchParams.searchQuery ||
      !compareObjects(fetchParams.columnFilters, newFetchParams.columnFilters)
    ) {
      return true;
    }
  }
  console.log('fetchParamsNewOrNot result => ', { result });
  return result;
};

export const updateFetchParams = ({
  fetchParamObjects,
  newPageNumber,
  newPageSize,
  newSearchQuery,
  newColumnFilters,
}: {
  fetchParamObjects: FetchParams[];
  newPageNumber: number;
  newPageSize: number;
  newSearchQuery: string;
  newColumnFilters: any;
}): FetchParams => {
  const fetchParams = fetchParamObjects[fetchParamObjects.length - 1];
  let pageSize = defaultSearchParams.newPageSize;
  let currentPage = defaultSearchParams.newPageNumber;
  let searchQuery = defaultSearchParams.newSearchQuery;
  let offset = 0;
  let totalCount = 0;
  let columnFilters = defaultSearchParams.newColumnFilters;
  if (fetchParams) {
    currentPage = fetchParams.currentPage;
    totalCount = fetchParams.totalCount;
    pageSize = fetchParams.pageSize;
    offset = fetchParams.offset;
    searchQuery = fetchParams.searchQuery;
    columnFilters = fetchParams.columnFilters;
  }
  console.log('from updateFetchParams => ', {
    fetchParams,
    newPageNumber,
    newPageSize,
  });
  pageSize = newPageSize;
  currentPage = newPageNumber;
  searchQuery = newSearchQuery;
  offset = (currentPage - 1) * pageSize;
  columnFilters = newColumnFilters;

  let newFetchParams = {
    currentPage,
    totalCount,
    pageSize,
    offset,
    searchQuery,
    columnFilters,
  };
  return Object.assign({}, newFetchParams);
};

export const parseDateTime = (dateTime: string): string => {
  if (dateTime === null) {
    return 'Never';
  }
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const newDate = new Date(dateTime);
  const m = newDate.getMonth();
  const d = newDate.getDate();
  const y = newDate.getFullYear();
  const h = newDate.getHours();
  const min = newDate.getMinutes();
  let adjustedmin = min.toString();
  if (min < 10) {
    adjustedmin = `0${min}`;
  }

  // we get the text name of the month by using the value of m to find the corresponding month name
  const mlong = months[m];

  const fullDate = `${d} ${mlong} ${y}, ${h}:${adjustedmin} Hrs`;
  return fullDate;
};

export const parseLastModified = (date: string) => {
  const currentDate = new Date();
  const modifiedDate = new Date(date);
  const secondsGone = Math.floor(
    (currentDate.getTime() - modifiedDate.getTime()) / 1000
  );
  const hrt = humanReadableTime(secondsGone);
  return hrt;
};

export const humanReadableTime = (time) => {
  if (time < 2 * minute) {
    return `moments ago`;
  } else if (time >= 2 * minute && time < hour) {
    return `${Math.ceil(time / minute)} mins ago`;
  } else if (time >= hour && time < 2 * hour) {
    return `1 hr ${Math.ceil((time - hour) / minute)} mins ago `;
  } else if (time >= 2 * hour && time < day) {
    return `${Math.ceil(time / hour)} hrs ${Math.ceil(
      (time % hour) / minute
    )} mins ago`;
  } else if (time >= day && time <= 2 * day) {
    return `1 day ${Math.ceil((time - day) / hour)} hrs ago`;
  } else if (time >= 2 * day && time < week) {
    return `${Math.ceil(time / day)} days ago`;
  } else if (time >= week && time < month) {
    return `${Math.ceil(time / week)} weeks ago`;
  } else if (time >= month && time < year) {
    return `${Math.ceil(time / month)} months ago`;
  } else if (time >= year && time < 2 * year) {
    return `1 yr ${Math.ceil((time - year) / month)} months ago`;
  } else if (time >= 2 * year) {
    return `${Math.ceil(time / year)} yrs ago`;
  } else return '';
};

export const convertKeyToLabel = (key: string): string => {
  return key
    .replace('_', ' ')
    .split(' ')
    .map((word) => word.toLowerCase())
    .map((word) => {
      const capLetter = word[0].toUpperCase();
      word = word.substring(1);
      return capLetter + word;
    })
    .join(' ');
};

export const autoGenOptions = (type: object): MatSelectOption[] => {
  const keys = Object.keys(type);
  return keys.map((key) => {
    return { value: type[key], label: convertKeyToLabel(key) };
  });
};

export const getErrorMessageFromGraphQLResponse = (errors): string => {
  console.log('From getERrorMessageFromGraphQLResponse ', {
    errors: JSON.stringify(errors),
  });
  const keys = Object.keys(errors);
  const message = errors[keys[0]][0]?.message;
  console.log('object.keys(errors) => ', { errors, keys, message });
  return message
    ? message
    : 'Something went wrong! Action could not be completed successfully.';
};

export const constructUserFullName = (user: User): string => {
  return user?.firstName + ' ' + user?.lastName;
};

export const constructPermissions = (permissions: UserPermissions) => {
  if (!permissions) {
    return defaultResourcePermissions;
  }
  // Newpermissions is based on the latest template that is part of the UI
  // The following steps ensure that whenever we get the permissions from the DB,
  // We automatically parse it to the latest version that is always part of the UI code.
  // This way, we can ensure that everything works even if the permissions in the db is outdated
  let newPermissions = Object.assign({}, defaultResourcePermissions);
  const resources = Object.keys(newPermissions);
  for (let i = 0; i < resources.length; i++) {
    const resource = newPermissions[resources[i]];
    // Fitting in the resource if it is missing in the permission
    const actions = Object.keys(resource);

    // Getting the actions within each resource right
    for (let j = 0; j < actions.length; j++) {
      const action = actions[j];
      const resourceObj = permissions[resources[i]];
      if (resourceObj) {
        const actionAuth = resourceObj[action];

        if (typeof actionAuth == 'boolean') {
          let newResourceObj = Object.assign({}, permissions[resources[i]]);
          newResourceObj[action] = actionAuth;
          // Assigning the permissions value for the action of the specific resource to the newPermissions
          newPermissions[resources[i]] = newResourceObj;
        }
      }
    }
  }
  return newPermissions;
};

export const compareObjects = (o1, o2) => {
  for (var p in o1) {
    if (o1.hasOwnProperty(p)) {
      if (o1[p] !== o2[p]) {
        return false;
      }
    }
  }
  for (var p in o2) {
    if (o2.hasOwnProperty(p)) {
      if (o1[p] !== o2[p]) {
        return false;
      }
    }
  }
  return true;
};
