import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { SearchParams } from '../modules/master-grid/table.model';

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
  PROJECTS_CLAPPED: 'PROJECTS_CLAPPED',
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
  LEARNER: 'Learner',
  CLASS_ADMIN_LEARNER: 'Class Admin Learner',
  GRADER: 'Grader',
};

export const ADMIN_SECTION_LABELS = {
  ISSUE: 'Issues',
  CLASS_ADMINS: 'Class Admins',
  INSTITUTIONS: 'Institutions',
  INSTITUTION_ADMINS: 'Institution Admins',
  LEARNERS: 'Learners',
  MEMBERS: 'Members',
  MODERATION: 'Moderation',
  USER_ROLES: 'User Roles',
};

/**
 * Marked options for import into modules that use Markdown
 */
export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.blockquote = (text: string) => {
    return '<blockquote class="blockquote"><p>' + text + '</p></blockquote>';
  };

  const linkRenderer = renderer.link;
  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
  };

  return {
    renderer: renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false,
  };
}

export const SORT_BY_OPTIONS = { NEW: 'NEW', TOP: 'TOP' };
