export interface NotificationStateModel {
  message: string;
  action?: string;
  duration?: number;
}

export const defaultNotificationState: NotificationStateModel = {
  message: '',
  action: 'Ok',
  duration: 3000,
};
