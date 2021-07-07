import {
  defaultResourcePermissions,
  MatSelectOption,
  PaginationObject,
  SUBSCRIPTION_METHODS,
  User,
  UserPermissions,
} from './models';
import { day, hour, minute, month, week, year } from './constants';

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
  paginationObject,
}: {
  items: any[];
  method: string;
  subscriptionItem: any;
  paginationObject: PaginationObject;
}) => {
  console.log('From SubscriptionUpdater method =>', {
    items,
    method,
    subscriptionItem,
    paginationObject,
  });
  if (subscriptionItem && method) {
    if (method == SUBSCRIPTION_METHODS.CREATE_METHOD) {
      paginationObject = {
        ...paginationObject,
        totalCount: paginationObject.totalCount + 1,
      };
      items = [subscriptionItem, ...items];
    } else if (method == SUBSCRIPTION_METHODS.UPDATE_METHOD) {
      items = items.map((i) =>
        i.id == subscriptionItem.id ? subscriptionItem : i
      );
    } else if (method == SUBSCRIPTION_METHODS.DELETE_METHOD) {
      items = items.filter((i) => i.id != subscriptionItem.id);
      paginationObject = {
        ...paginationObject,
        totalCount: paginationObject.totalCount - 1,
      };
    }
  }
  console.log('After updating items =>', { items, paginationObject });
  return { items, paginationObject };
};

export const paginationChanged = ({
  paginationObject,
  newPaginationObject,
}: {
  paginationObject: PaginationObject;
  newPaginationObject: PaginationObject;
}): boolean => {
  if (
    paginationObject.currentPage != newPaginationObject.currentPage ||
    paginationObject.pageSize != newPaginationObject.pageSize ||
    paginationObject.offset != newPaginationObject.offset ||
    paginationObject.searchQuery != newPaginationObject.searchQuery
  ) {
    return true;
  }
  return false;
};

export const updatePaginationObject = ({
  paginationObject,
  newPageNumber,
  newPageSize,
  newSearchQuery,
}) => {
  // Update paginationTokens
  let { currentPage, totalCount, pageSize, offset, searchQuery } =
    paginationObject;
  console.log('from updatePaginationObject => ', {
    paginationObject,
    newPageNumber,
    newPageSize,
  });
  pageSize = newPageSize;
  currentPage = newPageNumber;
  searchQuery = newSearchQuery;
  offset = (currentPage - 1) * pageSize;
  let newPaginationObject = {
    currentPage,
    totalCount,
    pageSize,
    offset,
    searchQuery,
  };
  return Object.assign({}, newPaginationObject);
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
  const resources = Object.keys(defaultResourcePermissions);
  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    // Fitting in the resource if it is missing in the permission
    permissions[resource] = permissions[resource]
      ? permissions[resource]
      : defaultResourcePermissions[resource];
    const actions = Object.keys(resource);
    // Getting the actions within each resource right
    for (let j = 0; j < actions.length; j++) {
      const action = actions[j];
      console.log(
        'From line 229',
        { permissions },
        'permission[resource][action]',
        permissions[resource][resource[action]]
      );
      permissions[resource][resource[action]] =
        typeof permissions[resource][resource[action]] == 'boolean'
          ? permissions[resource][resource[action]]
          : defaultResourcePermissions[resource][resource[action]];
    }
    // Sorting it in the proper order
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      permissions[resource] = permissions[resource]
        ? permissions[resource]
        : defaultResourcePermissions[resource];
    }
  }
  return permissions;
};

export const authorizeResource = (
  permissions: UserPermissions,
  resource: string,
  action: string
): boolean => {
  if (action == '*') {
    const keys = Object.keys(permissions[resource]);
    console.log('authorizeResources => ', { keys });
    for (let i = 0; i < keys.length; i++) {
      console.log('permission[resource]', permissions[resource]);
      console.log('permission[resource][i]', permissions[resource][keys[i]]);
      if (permissions[resource][keys[i]] == true) {
        return true;
      }
    }
    return false;
  } else {
    console.log(
      'permissions[resource]',
      permissions[resource],
      {
        permissions,
        resource,
        action,
      },
      'permissions[resource][action]',
      permissions[resource][action]
    );

    return permissions[resource] ? permissions[resource][action] : false;
  }
};
