import { CurrentMember, User } from '../../common/models';

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
  firstTimeSetup: boolean;
  activationEmailSent: Date;
  // userId: number;
  // currentMemberInstitutionId: number;
  // username: string;
  // firstName: string;
  // lastName: string;
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
  firstTimeSetup: false,
  activationEmailSent: null,
  // userId: null,
  // currentMemberInstitutionId: null,
  // username: null,
  // firstName: null,
  // lastName: null,
};
