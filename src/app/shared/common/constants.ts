import { SearchParams } from '../abstract/master-grid/table.model';

export const secondInMillseconds = 60000;
export const minute = 60;
export const hour = minute * 60;
export const day = hour * 24;
export const week = day * 7;
export const month = week * 4;
export const year = month * 12;

export const dateFormat = 'YYYY-MM-DD';

export const localStorageKeys = {
  AUTH_TOKEN_KEY: 'AUTH_TOKEN',
  AUTH_REFRESH_TOKEN_KEY: 'AUTH_REFRESH_TOKEN',
  EXPIRATION_KEY: 'EXPIRES_AT',
  REMEMBER_ME_KEY: 'REMEMBER_ME',
};

export const defaultLogos = {
  institution: 'https://i.imgur.com/dPO1MlY.png',
  user: 'https://i.imgur.com/KHtECqa.png',
  group: 'https://i.imgur.com/hNdMk4c.png',
  chat: 'https://i.imgur.com/dr06PoW.png',
};

export const defaultSearchParams = new SearchParams();

export const USER_ROLES_NAMES = {
  SUPER_ADMIN: 'Super Admin',
  INSTITUTION_ADMIN: 'Institution Admin',
  CLASS_ADMIN: 'Class Admin',
  CLASS_ADMIN_LEARNER: 'Class Admin Learner',
  LEARNER: 'Learner',
};
