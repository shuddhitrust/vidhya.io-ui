import { State, Action, StateContext } from '@ngxs/store';
import {
  NotificationStateModel,
  defaultNotificationState,
} from './notification.model';
import { ShowNotificationAction } from './notification.actions';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@State<NotificationStateModel>({
  name: 'notificationState',
  defaults: defaultNotificationState,
})
@Injectable()
export class NotificationState {
  constructor(private snackbar: MatSnackBar) {}

  @Action(ShowNotificationAction)
  showNotification(
    { getState, patchState }: StateContext<NotificationStateModel>,
    { payload }: ShowNotificationAction
  ) {
    const state = getState();
    let { action, duration } = state;
    const { message } = payload;
    action = payload.action ? payload.action : action;
    duration = payload.duration ? payload.duration : duration;
    patchState({ message, action, duration });
    this.snackbar.open(message, action, {
      duration,
      panelClass: ['color:#0099ff;'],
    });
  }
}
