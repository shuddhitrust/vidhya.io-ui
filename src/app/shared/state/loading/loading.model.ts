export interface LoadingStateModel {
  showLoadingScreen: Boolean;
  message?: string;
}

export const defaultLoadingState: LoadingStateModel = {
  showLoadingScreen: false,
  message: 'Loading...',
};
