import { localStorageKeys } from 'src/app/shared/common/constants';
import {
  CurrentMember,
  defaultResourcePermissions,
  UserPermissions,
} from '../../../shared/common/models';

export const AuthStorageOptions = {
  session: 'sessionStorage',
  local: 'localStorage',
  default: 'sessionStorage',
};

export const getProjectsClappedFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem(localStorageKeys.PROJECTS_CLAPPED));
};

export const getAuthStorageTypeFromClient = () => {
  const remember_me = JSON.parse(
    localStorage.getItem(localStorageKeys.REMEMBER_ME_KEY)
  );
  if (remember_me == true) {
    return AuthStorageOptions.local;
  } else return AuthStorageOptions.default;
};

const startingCurrentMember: CurrentMember = {
  id: null,
  username: null,
  firstName: null,
  lastName: null,
  name: null,
  title: null,
  bio: null,
  email: null,
  dob: null,
  mobile: null,
  phone: null,
  address: null,
  pincode: null,
  city: null,
  state: null,
  country: null,
  avatar: null,
  invitecode: null,
  designation:null,
  institution: { id: null, name: null ,designations:null, institutionType:null},
  membershipStatus: null,
  projectsClapped: getProjectsClappedFromLocalStorage(),
  role: null,
  createdAt: null,
  updatedAt: null,
};

export interface AuthStateModel {
  authStorageType: string;
  token: string;
  expiresAt: number;
  refreshToken: string;
  isSubmittingForm: boolean;
  closeLoginForm: boolean;
  isLoggedIn: boolean;
  isChangePasswordEnable: boolean;
  isGoogleLoggedIn: boolean;
  isManualLogIn: boolean;
  verificationEmail: string;
  isEmailOTPGenerated: boolean;
  isEmailVerified: boolean;
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
  authStorageType: getAuthStorageTypeFromClient(),
  token: null,
  expiresAt: null,
  refreshToken: null,
  isSubmittingForm: false,
  closeLoginForm: false,
  isLoggedIn: false,
  verificationEmail: null,
  isEmailOTPGenerated: false,
  isChangePasswordEnable: false,
  isGoogleLoggedIn: false,
  isManualLogIn: false,
  isEmailVerified: false,
  lastLogin: null,
  isFullyAuthenticated: false,
  isFetchingCurrentMember: false,
  currentMember: startingCurrentMember,
  permissions: defaultResourcePermissions,
  firstTimeSetup: false,
  activationEmailSent: null,
  subscriptionsInitiated: false,
};
