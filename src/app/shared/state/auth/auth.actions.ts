import { FormGroup, FormGroupDirective } from '@angular/forms';

export class RegisterAction {
  static readonly type = '[AUTH] Register';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
}

export class VerifyAccountAction {
  static readonly type = '[AUTH] Verify Account';

  constructor(
    public payload: { form: FormGroup; formDirective: FormGroupDirective }
  ) {}
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

export class GetCurrentUser {
  static readonly type = '[AUTH] Fetch Member';

  constructor() {}
}
