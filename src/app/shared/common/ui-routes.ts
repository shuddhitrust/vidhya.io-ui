import { resources, RESOURCE_ACTIONS } from './models';

export const uiroutes = {
  HOME_ROUTE: { route: 'activate', auth: { resource: null, action: null } },
  ACTIVATE_ACCOUNT_ROUTE: {
    route: 'activate',
    auth: { resource: null, action: null },
  },
  PASSWORD_RESET_ROUTE: {
    route: 'password-reset',
    auth: { resource: null, action: null },
  },
  RESEND_ACTIVATION_EMAIL_ROUTE: {
    route: 'resend-activatioin-email',
    auth: { resource: null, action: null },
  },
  DASHBOARD_ROUTE: {
    route: 'dashboard',
    auth: { resource: null, action: null },
  },
  PROFILE_ROUTE: { route: 'profile', auth: { resource: null, action: null } },
  ACCOUNT_ROUTE: { route: 'account', auth: { resource: null, action: null } },
  SUPPORT_ROUTE: { route: 'support', auth: { resource: null, action: null } },
  INSTITUTION_PROFILE_ROUTE: {
    route: 'institution',
    auth: { resource: resources.INSTITUTIONS, action: RESOURCE_ACTIONS.GET },
  },
  INSTITUTION_FORM_ROUTE: {
    route: 'institution-form',
    auth: { resource: resources.INSTITUTIONS, action: RESOURCE_ACTIONS.UPDATE },
  },
  MEMBER_PROFILE_ROUTE: {
    route: 'member-profile',
    auth: { resource: resources.MEMBERS, action: RESOURCE_ACTIONS.GET },
  },
  MEMBER_FORM_ROUTE: {
    route: 'member-form',
    auth: { resource: resources.MEMBERS, action: RESOURCE_ACTIONS.UPDATE },
  },
  USER_ROLE_PROFILE_ROUTE: {
    route: 'user-role-profile',
    auth: { resource: resources.USER_ROLES, action: RESOURCE_ACTIONS.GET },
  },
  USER_ROLE_FORM_ROUTE: {
    route: 'user-role-form',
    auth: { resource: resources.USER_ROLES, action: RESOURCE_ACTIONS.UPDATE },
  },
  GROUP_PROFILE_ROUTE: {
    route: 'group',
    auth: { resource: resources.GROUPS, action: RESOURCE_ACTIONS.GET },
  },
  GROUP_FORM_ROUTE: {
    route: 'group-form',
    auth: { resource: resources.GROUPS, action: RESOURCE_ACTIONS.UPDATE },
  },
  ANNOUNCEMENT_PROFILE_ROUTE: {
    route: 'announcement',
    auth: { resource: resources.ANNOUNCEMENTS, action: RESOURCE_ACTIONS.GET },
  },
  ANNOUNCEMENT_FORM_ROUTE: {
    route: 'announcement-form',
    auth: {
      resource: resources.ANNOUNCEMENTS,
      action: RESOURCE_ACTIONS.UPDATE,
    },
  },
  COURSE_PROFILE_ROUTE: {
    route: 'course',
    auth: { resource: resources.COURSES, action: RESOURCE_ACTIONS.GET },
  },
  COURSE_FORM_ROUTE: {
    route: 'course-form',
    auth: { resource: resources.COURSES, action: RESOURCE_ACTIONS.UPDATE },
  },
  ASSIGNMENT_PROFILE_ROUTE: {
    route: 'assignment',
    auth: { resource: resources.ASSIGNMENTS, action: RESOURCE_ACTIONS.GET },
  },
  ASSIGNMENT_FORM_ROUTE: {
    route: 'assignment-form',
    auth: { resource: resources.ASSIGNMENTS, action: RESOURCE_ACTIONS.UPDATE },
  },
  CHAT_ROUTE: { route: 'chat', auth: { resource: null, action: null } },
};
