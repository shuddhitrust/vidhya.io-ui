import { HotToastPositionOptions, HotToastStatus } from '../../common/models';

export interface NotificationStateModel {
  message: string;
  action: HotToastStatus;
  autoClose: boolean;
  dismissible: boolean;
  position: HotToastPositionOptions;
}

export const defaultNotificationState: NotificationStateModel = {
  message: '',
  action: 'show',
  autoClose: true,
  dismissible: true,
  position: 'bottom-left',
};
