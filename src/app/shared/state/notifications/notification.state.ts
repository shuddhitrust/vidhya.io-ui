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
    id: defaultNotificationState.id,
    duration: defaultNotificationState.duration,
  };
  constructor(private toastService: HotToastService) {}

  @Action(ShowNotificationAction)
  showNotification(
    { getState, patchState }: StateContext<NotificationStateModel>,
    { payload }: ShowNotificationAction
  ) {
    const state = getState();
    let { message, action, autoClose, id } = payload;
    autoClose =
      autoClose != null || autoClose != undefined
        ? autoClose
        : this.defaultConfig.autoClose;
    id = id != null || id != undefined ? id : this.defaultConfig.id;
    patchState({ message, action, autoClose });
    this.toastService[action](message, { ...this.defaultConfig, autoClose });
  }
}
