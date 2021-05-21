import { User } from '../../common/models';
import { emptyMemberFormRecord } from '../members/member.model';

export interface AuthStateModel {
  token: string;
  refreshToken: string;
  isSubmittingForm: boolean;
  isLoggedIn: boolean;
  lastLogin: string;
  isFullyAuthenticated: boolean;
  userId: string;
  currentMemberInstitutionId: string;
  username: string;
  name: string;
  currentMember: User;
  sessionBeginTime: number;
}

export const defaultAuthState: AuthStateModel = {
  token: null,
  refreshToken: null,
  isSubmittingForm: false,
  isLoggedIn: false,
  lastLogin: null,
  isFullyAuthenticated: false,
  userId: null,
  currentMemberInstitutionId: null,
  username: null,
  name: null,
  currentMember: emptyMemberFormRecord,
  sessionBeginTime: null,
};
