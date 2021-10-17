import {
  defaultResourcePermissions,
  MatSelectOption,
  FetchParams,
  SUBSCRIPTION_METHODS,
  User,
  UserPermissions,
  Chapter,
  Exercise,
  ExerciseSubmission,
  ExerciseSubmissionStatusOptions,
  Group,
  groupTypeOptions,
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

export const convertPaginatedListToNormalList = (paginatedObject) => {
  const keys = Object.keys(paginatedObject).sort();
  let finalArray = [];
  keys.forEach((key) => {
    finalArray = finalArray.concat(paginatedObject[key]);
  });
  return finalArray;
};

export const subscriptionUpdater = ({
  items,
  method,
  subscriptionItem,
  fetchParamObjects,
  pk = 'id',
}: {
  items: any[];
  method: string;
  subscriptionItem: any;
  fetchParamObjects: FetchParams[];
  pk?: string;
}) => {
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
        i[pk] == subscriptionItem[pk] ? subscriptionItem : i
      );
    } else if (method == SUBSCRIPTION_METHODS.DELETE_METHOD) {
      items = items.filter((i) => i[pk] != subscriptionItem[pk]);
      fetchParams = {
        ...fetchParams,
        totalCount: fetchParams.totalCount - 1,
      };
    }
  }
  const newFetchParamss = fetchParamObjects.concat([fetchParams]);

  return { items, fetchParamObjects: newFetchParamss };
};

export const paginatedSubscriptionUpdater = ({
  paginatedItems,
  method,
  modifiedItem,
  pk = 'id',
}: {
  paginatedItems: any;
  method: string;
  modifiedItem: any;
  fetchParamObjects?: FetchParams[];
  pk?: string;
}) => {
  let newPaginatedItems = {};
  if (modifiedItem && method) {
    if (method == SUBSCRIPTION_METHODS.CREATE_METHOD) {
      newPaginatedItems = Object.assign({}, paginatedItems);

      const firstPageItems = newPaginatedItems[1] ? newPaginatedItems[1] : [];
      let itemAlreadyExists = null;
      if (firstPageItems.length) {
        itemAlreadyExists = firstPageItems.find(
          (item) => item[pk] == modifiedItem[pk]
        );
      }

      if (!itemAlreadyExists) {
        const newFirstPage = [modifiedItem, ...firstPageItems];
        newPaginatedItems[1] = newFirstPage;
      }
    } else if (method == SUBSCRIPTION_METHODS.UPDATE_METHOD) {
      const pages = Object.keys(paginatedItems);
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageList = paginatedItems[page].map((item) => {
          return item[pk] == modifiedItem[pk]
            ? { ...item, ...modifiedItem }
            : item;
        });
        newPaginatedItems[page] = pageList;
      }
    } else if (method == SUBSCRIPTION_METHODS.DELETE_METHOD) {
      const pages = Object.keys(paginatedItems);
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageList = paginatedItems[page].filter((item) => {
          return item[pk] != modifiedItem[pk];
        });
        newPaginatedItems[page] = pageList;
      }
    }
  }
  const newItemsList = convertPaginatedListToNormalList(newPaginatedItems);

  return { newPaginatedItems, newItemsList };
};

// export const fetchParamsNewOrNot = ({
//   fetchParamObjects,
//   newFetchParams,
// }: {
//   fetchParamObjects: FetchParams[];
//   newFetchParams: FetchParams;
// }): boolean => {
//   let result = true;
//   // if (fetchParamObjects.length < 1) {
//   //   return true;
//   // }

//   if (fetchParamObjects.length > 0) {
//     const lastFetchParams = fetchParamObjects[fetchParamObjects.length - 1];
//     if (
//       lastFetchParams.currentPage == newFetchParams.currentPage &&
//       lastFetchParams.pageSize == newFetchParams.pageSize &&
//       lastFetchParams.offset == newFetchParams.offset &&
//       lastFetchParams.searchQuery == newFetchParams.searchQuery &&
//       compareObjects(
//         lastFetchParams.columnFilters,
//         newFetchParams.columnFilters
//       )
//     ) {
//       return false;
//     }
//   }

//   return result;
// };

export const columnFiltersChanged = ({
  fetchParamObjects,
  newFetchParams,
}: {
  fetchParamObjects: FetchParams[];
  newFetchParams: FetchParams;
}): boolean => {
  let result = true;
  // if (fetchParamObjects.length < 1) {
  //   return true;
  // }

  if (fetchParamObjects.length > 0) {
    const lastFetchParams = fetchParamObjects[fetchParamObjects.length - 1];
    if (
      compareObjects(
        lastFetchParams.columnFilters,
        newFetchParams.columnFilters
      )
    ) {
      return false;
    }
  }
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
  const lastFetchParams = fetchParamObjects[fetchParamObjects.length - 1];
  let pageSize = defaultSearchParams.pageSize;
  let currentPage = defaultSearchParams.pageNumber;
  let searchQuery = defaultSearchParams.searchQuery;
  let offset = 0;
  let totalCount = 0;
  let columnFilters = defaultSearchParams.columnFilters;
  if (lastFetchParams) {
    // Setting previous known value to totalCount
    totalCount = lastFetchParams.totalCount;
  }
  // ...and then setting the new values
  pageSize = newPageSize;
  currentPage = newPageNumber;
  offset = (currentPage - 1) * pageSize;
  searchQuery = newSearchQuery;
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

export const convertKeyToLabel = (key: string = ''): string => {
  return key
    ?.replace('_', ' ')
    .split(' ')
    .map((word) => word.toLowerCase())
    .map((word) => {
      let capLetter = word[0]?.toUpperCase();
      capLetter = capLetter ? capLetter : '';
      word = word.substring(1);
      word = word ? word : '';
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
  const keys = Object.keys(errors);
  const message = errors[keys[0]][0]?.message;

  return message
    ? message
    : 'Something went wrong! Action could not be completed successfully.';
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

/**
 * Method to compare two objects and return a boolean
 * @param o1 Object 1
 * @param o2 Object 2
 * @returns False if they are different, True if they are the same
 */
export const compareObjects = (o1, o2): boolean => {
  for (var p in o1) {
    if (o1.hasOwnProperty(p)) {
      if (o1?.[p] !== o2?.[p]) {
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

export const sortByIndex = (
  list: any[],
  indexPath: string = 'index',
  direction = 'ASC'
) => {
  const directionCoefficient = direction == 'ASC' ? 1 : -1;
  let newList = Object.assign([], list);
  return newList.sort(function (a, b) {
    const objectA = deepFind(a, indexPath);
    const objectB = deepFind(b, indexPath);
    return (objectA - objectB) * directionCoefficient;
  });
};

export const deepFind = (obj, path) => {
  var paths = path.split('.'),
    current = obj,
    i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
};

export const sortArrayOfObjectsByString = (array: any[], key: string) => {
  function compare(a, b) {
    if (a[key] < b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
    return 0;
  }
  return array.sort(compare);
};

export const preventSpaces = (event) => {
  const space = event.code == 'Space';
  if (space) {
    event.preventDefault();
  }
  return !space;
};

export const preventSymbols = (event) => {
  return (
    (event.which >= 48 && event.which <= 57) ||
    (event.which >= 65 && event.which <= 90) ||
    (event.which >= 97 && event.which <= 122)
  );
};

export const sanitizeUsername = (event) => {
  const noSymbols = preventSymbols(event);
  const noSpace = preventSpaces(event);
  const validEntry = noSpace && noSymbols;
  if (validEntry) {
    event.target.value = event.target.value.toLowerCase();
  }
  return validEntry;
};

export const ChapterTitle = (chapter: Chapter): string => {
  return `${chapter.section?.index ? chapter.section?.index + '.' : ''}${
    chapter.index ? chapter.index : ''
  } ${chapter.title}`;
};

export const ChapterSubtitle = (chapter: Chapter): string => {
  return `${chapter.course?.title} ${
    chapter.section?.title ? ' > ' + chapter.section?.title + '. ' : '. '
  }${chapter.points} points. ${
    chapter.dueDate ? `Due on ${parseDateTime(chapter?.dueDate)}` : ''
  }`;
};

export const ExerciseTitle = (chapter: Chapter, exercise: Exercise): string => {
  return `${chapter.section?.index ? `${chapter.section?.index}.` : ''}${
    chapter?.index ? `${chapter?.index}.` : ''
  }${exercise.index})`;
};

export const SubmissionStatus = (submission: ExerciseSubmission): string => {
  let result = 'Not yet submitted';
  if (submission.status == ExerciseSubmissionStatusOptions.pending) {
    result = 'Not yet submitted';
  } else if (submission.status == ExerciseSubmissionStatusOptions.submitted) {
    result = 'Awaiting grading';
  } else if (submission.status == ExerciseSubmissionStatusOptions.returned) {
    result = `Your work was returned ${
      submission.grader?.name ? `by ${submission.grader.name}` : ''
    }`;
  } else if (submission.status == ExerciseSubmissionStatusOptions.graded) {
    result = `This was graded ${
      submission.grader?.name
        ? `by ${submission.grader?.name} `
        : 'automatically '
    } at ${
      parseDateTime(submission.updatedAt)
        ? parseDateTime(submission.updatedAt)
        : parseDateTime(submission.createdAt)
    }`;
  }
  return result;
};

export const SubmissionPoints = (
  submission: ExerciseSubmission,
  exercise: Exercise
): string => {
  const submissionPoints = submission?.points ? submission?.points : '0';
  const exercisePoints = exercise?.points ? exercise?.points : '0';
  return exercise?.points
    ? `${submissionPoints} / ${exercisePoints} points`
    : '';
};

export const getKeyForValue = (
  object: any,
  value: string,
  capitalize: boolean = true
): string => {
  const keys = Object.keys(object);
  const values = Object.values(object);
  const keyExists = values.indexOf(value);
  if (keyExists >= 0) {
    const key = keys[keyExists];
    return capitalize ? convertKeyToLabel(key) : key;
  } else return null;
};

export const generateMemberSubtitle = (user) => {
  const title = user.title ? user.title + ', ' : '';
  const institution = user.institution?.name ? user.institution?.name : '';
  return title + institution;
};

export const generateGroupSubtitle = (group: Group): string => {
  const groupType =
    groupTypeOptions.find((option) => option.value == group?.groupType)?.label +
    ' Group';
  let admins = group?.admins?.map((a) => a.name).join(', ');
  // Clipping the admins if there are too many admins
  admins =
    ', ' + (admins ? 'Administered by ' + clipLongText(admins, 50) : admins);
  return `${groupType}, ${
    group?.institution?.name
  }${admins}, Created on ${parseDateTime(group?.createdAt)}`;
};

export const clipLongText = (string = '', length = 100) => {
  return string.slice(0, length);
};

export const sanitizeCount = (count, length = 1) => {
  let indicator = '9';
  let index = 1;
  while (index < length) {
    indicator = indicator + '9';
    index++;
  }
  indicator = indicator + '+';
  return count.toString().length <= length ? count : indicator;
};
