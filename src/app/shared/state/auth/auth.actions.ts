import { idPayload } from '../../common/models';

export class LoginAction {
  static readonly type = '[AUTH] Login';

  constructor() {}
}

export class LogoutAction {
  static readonly type = '[AUTH] Logout';

  constructor() {}
}

export class GetCurrentUser {
  static readonly type = '[AUTH] Fetch Member';

  constructor() {}
}
