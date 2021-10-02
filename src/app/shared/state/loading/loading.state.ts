import { State, Action, StateContext, Selector } from '@ngxs/store';
import { LoadingStateModel, defaultLoadingState } from './loading.model';
import { ToggleLoadingScreen } from './loading.actions';
import { Injectable } from '@angular/core';

@State<LoadingStateModel>({
  name: 'loadingState',
  defaults: defaultLoadingState,
})
@Injectable()
export class LoadingState {
  constructor() {}

  @Selector()
  static getShowLoading(state: LoadingStateModel) {
    return state.showLoadingScreen;
  }

  @Selector()
  static getLoadingMessage(state: LoadingStateModel) {
    return state.message;
  }

  @Action(ToggleLoadingScreen)
  toggleLoadingScreen(
    { getState, patchState }: StateContext<LoadingStateModel>,
    { payload }: ToggleLoadingScreen
  ) {
    const state = getState();
    let { showLoadingScreen, message } = payload;
    message = payload?.message ? payload?.message : state?.message;
    patchState({ showLoadingScreen, message });
  }
}
