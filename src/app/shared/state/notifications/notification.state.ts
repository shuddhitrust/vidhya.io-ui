import { State, Action, StateContext } from '@ngxs/store';
import {
  NotificationStateModel,
  defaultNotificationState,
} from './notification.model';
import { ShowNotificationAction } from './notification.actions';
import { Injectable } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';

@State<NotificationStateModel>({
  name: 'notificationState',
  defaults: defaultNotificationState,
})
@Injectable()
export class NotificationState {
  defaultConfig = {
    autoClose: defaultNotificationState.autoClose,
    dismissible: defaultNotificationState.dismissible,
    position: defaultNotificationState.position,
  };
  constructor(private toastService: HotToastService) {}

  @Action(ShowNotificationAction)
  showNotification(
    { getState, patchState }: StateContext<NotificationStateModel>,
    { payload }: ShowNotificationAction
  ) {
    const state = getState();
    const { message, action } = payload;
    patchState({ message, action });
    console.log('notification message ', {
      message,
      action,
      config: this.defaultConfig,
    });
    this.toastService[action](message, this.defaultConfig);
  }
}
