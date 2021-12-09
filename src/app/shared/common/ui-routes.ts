import { resources, RESOURCE_ACTIONS } from './models';

export const uiroutes = {
  ERROR_ROUTE: { route: 'error', auth: { resource: null, actions: [] } },
  HOME_ROUTE: { route: '', auth: { resource: null, actions: [] } },
  ACTIVATE_ACCOUNT_ROUTE: {
    route: 'activate',
    auth: { resource: null, actions: [] },
  },
  REGISTER_ROUTE: {
    route: 'register',
    auth: { resource: null, actions: [] },
  },
  PASSWORD_RESET_ROUTE: {
    route: 'password-reset',
    auth: { resource: null, actions: [] },
  },
  RESEND_ACTIVATION_EMAIL_ROUTE: {
    route: 'resend-activatioin-email',
    auth: { resource: null, actions: [] },
  },
  DASHBOARD_ROUTE: {
    route: 'dashboard',
    auth: { resource: null, actions: [] },
  },
  PROFILE_ROUTE: { route: 'profile', auth: { resource: null, actions: [] } },
  ACCOUNT_ROUTE: { route: 'account', auth: { resource: null, actions: [] } },
  SUPPORT_ROUTE: { route: 'support', auth: { resource: null, actions: [] } },
  PRIVACY_ROUTE: { route: 'privacy', auth: { resource: null, actions: [] } },
  TERMS_CONDITIONS_ROUTE: {
    route: 'terms-conditions',
    auth: { resource: null, actions: [] },
  },
  INSTITUTION_PROFILE_ROUTE: {
    route: 'institution',
    auth: { resource: null, actions: [] },
  },
  INSTITUTION_FORM_ROUTE: {
    route: 'institution-form',
    auth: {
      resource: resources.INSTITUTION,
      actions: [RESOURCE_ACTIONS.CREATE, RESOURCE_ACTIONS.UPDATE],
    },
  },
  MEMBER_PROFILE_ROUTE: {
    route: 'profile',
    auth: { resource: null, actions: [] },
  },
  MEMBER_FORM_ROUTE: {
    route: 'member-form',
    auth: {
      resource: resources.MEMBER,
      actions: [RESOURCE_ACTIONS.CREATE, RESOURCE_ACTIONS.UPDATE],
    },
  },
  PROJECT_PROFILE_ROUTE: {
    route: 'project',
    auth: {
      resource: resources.PROJECT,
      actions: [RESOURCE_ACTIONS.GET],
    },
  },
  PROJECT_FORM_ROUTE: {
    route: 'project-form',
    auth: {
      resource: resources.PROJECT,
      actions: [RESOURCE_ACTIONS.CREATE, RESOURCE_ACTIONS.UPDATE],
    },
  },
  ISSUE_PROFILE_ROUTE: {
    route: 'issue',
    auth: {
      resource: null,
      actions: [],
    },
  },
  ISSUE_FORM_ROUTE: {
    route: 'issue-form',
    auth: {
      resource: null,
      actions: [],
    },
  },
  OWN_ISSUES_ROUTE: {
    route: 'own-issues',
    auth: {
      resource: null,
      actions: [],
    },
  },
  USER_ROLE_PROFILE_ROUTE: {
    route: 'user-role-profile',
    auth: { resource: resources.USER_ROLE, actions: [RESOURCE_ACTIONS.GET] },
  },
  USER_ROLE_FORM_ROUTE: {
    route: 'user-role-form',
    auth: {
      resource: resources.USER_ROLE,
      actions: [RESOURCE_ACTIONS.CREATE, RESOURCE_ACTIONS.UPDATE],
    },
  },
  GROUP_PROFILE_ROUTE: {
    route: 'group',
    auth: { resource: resources.GROUP, actions: [RESOURCE_ACTIONS.GET] },
  },
  GROUP_FORM_ROUTE: {
    route: 'group-form',
    auth: {
      resource: resources.GROUP,
      actions: [RESOURCE_ACTIONS.CREATE, RESOURCE_ACTIONS.UPDATE],
    },
  },
  GRADING_PROFILE_ROUTE: {
    route: 'grading',
    auth: { resource: resources.GRADING, actions: [RESOURCE_ACTIONS.GET] },
  },
  GRADING_FORM_ROUTE: {
    route: 'grading-form',
    auth: {
      resource: resources.GRADING,
      actions: [RESOURCE_ACTIONS.CREATE, RESOURCE_ACTIONS.UPDATE],
    },
  },
  ANNOUNCEMENT_PROFILE_ROUTE: {
    route: 'announcement',
    auth: {
      resource: resources.ANNOUNCEMENT,
      actions: [RESOURCE_ACTIONS.GET],
    },
  },
  ANNOUNCEMENT_FORM_ROUTE: {
    route: 'announcement-form',
    auth: {
      resource: resources.ANNOUNCEMENT,
      actions: [RESOURCE_ACTIONS.CREATE, RESOURCE_ACTIONS.UPDATE],
    },
  },
  COURSE_PROFILE_ROUTE: {
    route: 'course',
    auth: { resource: resources.COURSE, actions: [RESOURCE_ACTIONS.GET] },
  },
  COURSE_FORM_ROUTE: {
    route: 'course-form',
    auth: {
      resource: resources.COURSE,
      actions: [RESOURCE_ACTIONS.CREATE, RESOURCE_ACTIONS.UPDATE],
    },
  },
  CHAPTER_PROFILE_ROUTE: {
    route: 'chapter',
    auth: { resource: resources.CHAPTER, actions: [RESOURCE_ACTIONS.GET] },
  },
  CHAPTER_FORM_ROUTE: {
    route: 'chapter-form',
    auth: {
      resource: resources.CHAPTER,
      actions: [RESOURCE_ACTIONS.CREATE, RESOURCE_ACTIONS.UPDATE],
    },
  },
  CHAT_ROUTE: { route: 'chat', auth: { resource: null, actions: [] } },
};
