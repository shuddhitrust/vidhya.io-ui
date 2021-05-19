import { NotificationStateModel } from './notification.model';

export class ShowNotificationAction {
  static readonly type = '[NOTIFICATION] Show';

  constructor(public payload: NotificationStateModel) {}
}
