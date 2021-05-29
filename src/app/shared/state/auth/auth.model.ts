export interface AuthStateModel {
  token: string;
  expiresAt: number;
  refreshToken: string;
  isSubmittingForm: boolean;
  isLoggedIn: boolean;
  lastLogin: string;
  isFullyAuthenticated: boolean;
  userId: number;
  currentMemberInstitutionId: number;
  username: string;
  nickName: string;
}

export const defaultAuthState: AuthStateModel = {
  token: null,
  expiresAt: null,
  refreshToken: null,
  isSubmittingForm: false,
  isLoggedIn: false,
  lastLogin: null,
  isFullyAuthenticated: false,
  userId: null,
  currentMemberInstitutionId: null,
  username: null,
  nickName: null,
};
