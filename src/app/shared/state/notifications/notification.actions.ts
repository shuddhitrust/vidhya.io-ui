import { HotToastStatus } from '../../common/models';
import { NotificationStateModel } from './notification.model';

export class ShowNotificationAction {
  static readonly type = '[NOTIFICATION] Show';

  constructor(
    public payload: {
      message: string;
      action: HotToastStatus;
      autoClose?: boolean;
      id?: string;
    }
  ) {}
}
