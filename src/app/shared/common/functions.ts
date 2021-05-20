import { MatSelectOption, PaginationObject } from './models';
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

export const setNextToken = (paginationObject: PaginationObject): string => {
  const { paginationTokens, pageIndex } = paginationObject;
  return paginationTokens[pageIndex];
};

export const updatePaginationObject = (
  paginationObject: PaginationObject,
  nextToken: string
) => {
  // Update paginationTokens
  let { paginationTokens, pageIndex, previousPageDisabled, nextPageDisabled } =
    paginationObject;
  const tokensArray = Object.values(paginationTokens);
  const nextTokenExists = tokensArray.includes(nextToken);
  let newPaginationTokens;
  if (nextTokenExists) {
    newPaginationTokens = paginationTokens;
  } else {
    paginationTokens = Object.assign({}, paginationTokens);
    paginationTokens[tokensArray.length + 1] = nextToken;
    newPaginationTokens = paginationTokens;
  }
  // Update show/hide of pagination buttons

  (previousPageDisabled = pageIndex == 1 ? true : false),
    (nextPageDisabled = nextToken == null ? true : false),
    (paginationObject = {
      ...paginationObject,
      paginationTokens: newPaginationTokens,
      previousPageDisabled,
      nextPageDisabled,
    });
  return paginationObject;
};

export const parseDateTime = (dateTime: string): string => {
  if (dateTime === null) {
    return 'Never';
  }
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'apr',
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

const humanReadableTime = (time) => {
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

const convertKeyToLabel = (key: string): string => {
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
    return { value: key, label: convertKeyToLabel(key) };
  });
};

export const getErrorMessageFromGraphQLResponse = (errors): string => {
  const keys = Object.keys(errors);
  const message = errors[keys[0]][0].message;
  return message ? message : 'Something went wrong!';
};
