import { FormGroup, FormGroupDirective } from '@angular/forms';
import { CurrentMember } from '../../../shared/common/models';

export class SetAuthSessionAction {
  static readonly type = '[AUTH] Set Auth Session';
  constructor() {}
}
export class UpdateTokenExpiry {
  static readonly type = '[AUTH] Update Token Expiry';
  constructor(public payload: { expiresAt: number }) {}
}

export class UpdateTokenAction {
  static readonly type = '[AUTH] Set Token to state';
  constructor(public payload: { token: string; refreshToken: string }) {}
}

export class VerifyTokenAction {
  static readonly type = '[AUTH] Verify Token';
  constructor() {}
}

export class VerifyInvitecodeAction {
  static readonly type = '[AUTH] Verify Invitecode';

  constructor(public payload: { form: FormGroup }) {}
}
export class RegisterAction {
  static readonly type = '[AUTH] Register';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class AddInvitecodeAction {
  static readonly type = '[AUTH] ADD INVITECODE';

  constructor(public payload: { invitecode: string; email: string }) {}
}
export class VerifyAccountAction {
  static readonly type = '[AUTH] Verify Account';

  constructor(public payload: { token: string }) {}
}

export class GetInstitutionByInvitecodeAction {
  static readonly type = '[AUTH] GET INSTITUTION BY INVITECODE';

  constructor(public payload: { currentMember: CurrentMember }) {}
}

export class ResendActivationEmailAction {
  static readonly type = '[AUTH] Resend Activation Email';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}
export class LoginAction {
  static readonly type = '[AUTH] Login';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class SendPasswordResetEmailAction {
  static readonly type = '[AUTH] Send Password Reset Email';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class PasswordResetAction {
  static readonly type = '[AUTH] Reset Password';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class PasswordChangeAction {
  static readonly type = '[AUTH] Password Change';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class LogoutAction {
  static readonly type = '[AUTH] Logout';

  constructor() {}
}

export class GetCurrentUserAction {
  static readonly type = '[AUTH] Fetch Member';

  constructor() {}
}

export class UpdateCurrentUserInStateAction {
  static readonly type = '[AUTH] Update Current User in state';

  constructor(public payload: { user: CurrentMember }) {}
}

export class AuthenticationCheckAction {
  static readonly type = '[AUTH] Check Authentication';

  constructor() {}
}

export class RefreshTokenAction {
  static readonly type = '[AUTH] Refresh Token';

  constructor() {}
}

export class CompleteLogoutAction {
  static readonly type = '[AUTH] Finish Logging out';

  constructor() {}
}

export class OpenLoginFormAction {
  static readonly type = '[AUTH] Open Login form';

  constructor() {}
}

export class SetAuthStorage {
  static readonly type = '[AUTH] Set Auth Storage';

  constructor(public payload: { remember: boolean }) {}
}

export class GetAuthStorage {
  static readonly type = '[AUTH] Get Auth Storage';

  constructor() {}
}
