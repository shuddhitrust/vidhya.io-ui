import { HotToastPositionOptions, HotToastStatus } from '../../common/models';

export interface NotificationStateModel {
  message: string;
  action: HotToastStatus;
  autoClose: boolean;
  dismissible: boolean;
  position: HotToastPositionOptions;
  id: string;
}

export const defaultNotificationState: NotificationStateModel = {
  message: '',
  action: 'show',
  autoClose: true,
  dismissible: true,
  position: 'bottom-center',
  id: null,
};
