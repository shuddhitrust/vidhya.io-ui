import { LoadingStateModel } from './loading.model';

export class ToggleLoadingScreen {
  static readonly type = '[LOADING SCREEN] Toggle';

  constructor(public payload: LoadingStateModel) {}
}
