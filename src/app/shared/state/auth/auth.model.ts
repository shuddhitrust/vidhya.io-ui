import { CurrentMember, User } from '../../common/models';

export interface AuthStateModel {
  token: string;
  expiresAt: number;
  refreshToken: string;
  isSubmittingForm: boolean;
  isLoggedIn: boolean;
  lastLogin: string;
  isFullyAuthenticated: boolean;
  currentMember: CurrentMember;
  firstTimeSetup: boolean;
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
  isLoggedIn: false,
  lastLogin: null,
  isFullyAuthenticated: false,
  currentMember: null,
  firstTimeSetup: false,
  // userId: null,
  // currentMemberInstitutionId: null,
  // username: null,
  // firstName: null,
  // lastName: null,
};
