import {
  CurrentMember,
  defaultResourcePermissions,
  UserPermissions,
} from '../../common/models';

export interface AuthStateModel {
  token: string;
  expiresAt: number;
  refreshToken: string;
  isSubmittingForm: boolean;
  closeLoginForm: boolean;
  isLoggedIn: boolean;
  lastLogin: string;
  isFullyAuthenticated: boolean;
  isFetchingCurrentMember: boolean;
  currentMember: CurrentMember;
  permissions: UserPermissions;
  firstTimeSetup: boolean;
  activationEmailSent: Date;
  subscriptionsInitiated: boolean;
}

export const defaultAuthState: AuthStateModel = {
  token: null,
  expiresAt: null,
  refreshToken: null,
  isSubmittingForm: false,
  closeLoginForm: false,
  isLoggedIn: false,
  lastLogin: null,
  isFullyAuthenticated: false,
  isFetchingCurrentMember: false,
  currentMember: null,
  permissions: defaultResourcePermissions,
  firstTimeSetup: false,
  activationEmailSent: null,
  subscriptionsInitiated: false,
};
