import {
  State,
  Action,
  StateContext,
  Selector,
  Store,
  Select,
} from '@ngxs/store';
import { AuthStateModel, defaultAuthState } from './auth.model';
import * as moment from 'moment';

import { Injectable } from '@angular/core';
import {
  RegisterAction,
  LoginAction,
  VerifyAccountAction,
  ResendActivationEmailAction,
  SendPasswordResetEmailAction,
  PasswordResetAction,
  PasswordChangeAction,
  AuthenticationCheckAction,
  SetAuthSessionAction,
  VerifyTokenAction,
  LogoutAction,
  GetCurrentUserAction,
  RefreshTokenAction,
} from './auth.actions';
import { ShowNotificationAction } from '../notifications/notification.actions';
import { Apollo } from 'apollo-angular';
import { AUTH_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { AUTH_QUERIES, USER_QUERIES } from '../../api/graphql/queries.graphql';
import { getErrorMessageFromGraphQLResponse } from '../../common/functions';
import {
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  minute,
} from '../../common/constants';
import jwtDecode from 'jwt-decode';
import { Observable } from 'rxjs';
import { ToggleLoadingScreen } from '../loading/loading.actions';

/**
 * Auth flow:-
 * - When the application loads, it runs the AuthenticationCheckAction which looks for the token and refreshToken in localStorage
 * - If the token exists, it calls the VerifyTokenAction to see if that token is valid.
 * - If the token is invalid, the user is shown the logged out state.
 * - If it is valid, it will store the token and the refreshToken in the state along with the expiryAt,
 * which is decoded from the token at the time of storing it in the state
 * - Once the change in expiryAt is detected by the expiresAt$ observable in the constructor,
 * it calls the startAutoRefreshTokenTimeout method to initiate a calculated timeout method that executes
 * the RefreshTokenAction a set time (say 1 minute, configurable) just before the token is set to expire.
 * - When the new refreshToken and token are sent from the backend, it is stored in the state,
 * once again expiryAt is extracted from the decoded token and stored in the state, triggering the startAutoRefreshTokenTimeout method and the cycle continues
 * indefinitely, as long as the user doesn't leave a gap of over 7 days between sessions, at which point the refreshToken expires.
 * - When the user logs out, the RevokeTokenAction is initiated and when that is complete,
 * the token and refreshToken are removed from the localstorage, the state is set to default state, forcing the app to show the logged out state in the UI.
 */
@State<AuthStateModel>({
  name: 'authState',
  defaults: defaultAuthState,
})
@Injectable()
export class AuthState {
  refreshTokenTimeout; // Variable that stores the timeout method for the next RefreshToken call
  @Select(AuthState.getExpiresAt)
  expiresAt$: Observable<string>;
  constructor(private store: Store, private apollo: Apollo) {
    // Looking for updates in the expiresAt value...
    this.expiresAt$.subscribe((val) => {
      // Calling the startAutoRefreshTokenTimeout method the moment a new expiresAt value is detected
      if (val) {
        this.startAutoRefreshTokenTimeout(val);
      }
    });
  }
  /**
   * Creates a timeout method to call for refreshToken just a minute before
   * @param expiresAt
   */
  startAutoRefreshTokenTimeout = (expiresAt) => {
    console.log('***Starting the autoRefreshToken Timeout', {
      date: new Date(expiresAt * 1000),
    });
    const expires = new Date(expiresAt * 1000);
    const timeBeforeExpiry = minute;
    const timeout = expires.getTime() - Date.now() - timeBeforeExpiry * 1000;
    this.refreshTokenTimeout = setTimeout(
      () => this.store.dispatch(new RefreshTokenAction()),
      timeout
    );
  };

  @Selector()
  static getExpiresAt(state: AuthStateModel): number {
    return state.expiresAt;
  }

  @Selector()
  static getIsLoggedIn(state: AuthStateModel): boolean {
    return state.isLoggedIn;
  }
  @Selector()
  static getIsSubmittingForm(state: AuthStateModel): boolean {
    return state.isSubmittingForm;
  }

  @Action(AuthenticationCheckAction)
  checkAuthentication({ patchState }: StateContext<AuthStateModel>) {
    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Checking authentication status...',
      })
    );
    const localStorageToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const localStorageRefreshToken = localStorage.getItem(
      AUTH_REFRESH_TOKEN_KEY
    );
    console.log('from checkAuthentication => ', {
      localStorageToken,
    });
    if (localStorageToken) {
      this.store.dispatch(
        new VerifyTokenAction({
          token: localStorageToken,
          refreshToken: localStorageRefreshToken,
        })
      );
    } else {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: false,
          message: 'Logging out...',
        })
      );
      // Marking user as logged out
      patchState(defaultAuthState);
      this.store.dispatch(new SetAuthSessionAction());
    }
  }

  @Action(RefreshTokenAction)
  refreshToken({ getState, patchState }: StateContext<AuthStateModel>) {
    const state = getState();
    console.log('calling refresh token method', { state });
    const { refreshToken } = state;
    if (refreshToken) {
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.REFRESH_TOKEN,
          variables: {
            refreshToken,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.refreshToken;
            console.log('data from verify token response ', {
              data,
              response,
              success: response.success,
            });
            const { token, refreshToken } = response;
            if (response.success) {
              console.log('token refreshed successfully', { token });
              const expiresAt = getExpiration(token);
              patchState({
                token,
                refreshToken,
                expiresAt,
                isLoggedIn: true,
              });
              this.store.dispatch(new SetAuthSessionAction());
              console.log({ state: getState() });
              this.store.dispatch(new GetCurrentUserAction());
            }
          },
          (error) => {
            console.error('There was an error ', error);
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'There was an error!',
                action: 'error',
              })
            );
          }
        );
    }
  }

  @Action(VerifyTokenAction)
  verifyToken(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: VerifyTokenAction
  ) {
    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Validating session...',
      })
    );
    const { token, refreshToken } = payload;
    this.apollo
      .mutate({
        mutation: AUTH_MUTATIONS.VERIFY_TOKEN,
        variables: {
          token,
        },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.verifyToken;
          console.log('data from verify token response ', {
            data,
            response,
            success: response.success,
          });
          if (response.success) {
            console.log('token verified successfully', { token });
            const expiresAt = getExpiration(token);
            console.log('decodedToken');
            patchState({
              token,
              refreshToken,
              expiresAt,
              isLoggedIn: true,
            });
            console.log({ state: getState() });
            this.store.dispatch(new GetCurrentUserAction());
          } else {
            this.store.dispatch(
              new ToggleLoadingScreen({
                showLoadingScreen: false,
                message: 'Validating session...',
              })
            );
            // Marking user as logged out
            patchState(defaultAuthState);
            this.store.dispatch(new SetAuthSessionAction());
          }
        },
        (error) => {
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
          console.error('There was an error ', error);
          this.store.dispatch(
            new ShowNotificationAction({
              message: 'There was an error!',
              action: 'error',
            })
          );
        }
      );
  }

  @Action(SetAuthSessionAction)
  setAuthSession({ getState }: StateContext<AuthStateModel>) {
    const state = getState();
    const { token, refreshToken } = state;
    console.log('Setting to local storage => ', { token, refreshToken });
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    if (refreshToken) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    }
    // localStorage.setItem(EXPIRATION_KEY, expiresAt);
  }

  @Action(GetCurrentUserAction)
  getCurrentUser({ getState, patchState }: StateContext<AuthStateModel>) {
    const state = getState();
    const { isLoggedIn } = state;
    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Fetching user info...',
      })
    );
    this.apollo
      .watchQuery({ query: USER_QUERIES.GET_USER, variables: { id: 4 } })
      .valueChanges.subscribe(({ data }: any) => {
        this.store.dispatch(
          new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
        );
        console.log('***********From getCurrentUser => ', { data });
        const user = data.user;
        const institutionId = data.user?.institution?.id;
        const isFullyAuthenticated =
          isLoggedIn == true && institutionId !== null;
        patchState({
          name: user.name,
          username: user.usersname,
          currentMemberInstitutionId: institutionId,
          isFullyAuthenticated,
        });
      });
  }

  @Action(LoginAction)
  login(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: LoginAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { isSubmittingForm } = state;
    if (form.valid) {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Authenticating...',
        })
      );
      isSubmittingForm = true;
      const values = form.value;
      patchState({ isSubmittingForm });
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.LOGIN,
          variables: {
            username: values.username,
            password: values.password,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.tokenAuth;
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            console.log('got data', { data });
            if (response.success) {
              form.reset();
              formDirective.resetForm();
              const institutionId = response?.user?.institution?.id;
              const token = response?.token;

              const expiresAt = getExpiration(token);
              console.log('*****moment of expiresAt => ', {
                expiresAt: moment(expiresAt).toLocaleString(),
                iat: moment(token.iAt),
              });
              patchState({
                token,
                expiresAt,
                refreshToken: response?.refreshToken,
                username: response?.user?.username,
                name: response?.user?.name,
                lastLogin: response?.user?.lastLogin,
                currentMemberInstitutionId: institutionId,
              });
              this.store.dispatch(
                new ToggleLoadingScreen({
                  showLoadingScreen: false,
                  message: '',
                })
              );
              this.store.dispatch(new SetAuthSessionAction());
              this.store.dispatch(new AuthenticationCheckAction());
              this.store.dispatch(
                new ShowNotificationAction({
                  message: 'Logged in successfully!',
                  action: 'success',
                })
              );
            } else {
              this.store.dispatch(
                new ToggleLoadingScreen({
                  showLoadingScreen: false,
                  message: '',
                })
              );
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
          },
          (error) => {
            this.store.dispatch(
              new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
            );
            console.error('There was an error ', error);
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'There was an error in submitting your form!',
                action: 'error',
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please make sure there are no errors in the form before attempting to submit!',
          action: 'error',
        })
      );
    }
  }

  @Action(LogoutAction)
  logout({ getState, patchState }: StateContext<AuthStateModel>) {
    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Logging out...',
      })
    );
    const state = getState();
    const { refreshToken } = state;
    this.apollo
      .mutate({
        mutation: AUTH_MUTATIONS.REVOKE_TOKEN,
        variables: { refreshToken },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.revokeToken;
          // Clearing the refreshToken timeout
          clearTimeout(this.refreshTokenTimeout);
          // Marking user as logged out
          patchState(defaultAuthState);
          this.store.dispatch(new SetAuthSessionAction());
          this.store.dispatch(new AuthenticationCheckAction());
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
          if (response.success) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Successfully Logged out!',
                action: 'success',
              })
            );
          }
        },
        (error) => {
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
          console.error('There was an error', error);
          this.store.dispatch(
            new ShowNotificationAction({
              message: 'There was an error in submitting your form!',
              action: 'error',
            })
          );
        }
      );
  }

  @Action(RegisterAction)
  register(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: RegisterAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { isSubmittingForm } = state;
    if (form.valid) {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Completing registration...',
        })
      );
      isSubmittingForm = true;
      const values = form.value;
      patchState({ isSubmittingForm });
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.REGISTER,
          variables: {
            username: values.username,
            email: values.email,
            password1: values.password1,
            password2: values.password2,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.register;
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            console.log('got data', { data });
            if (response?.success) {
              form.reset();
              formDirective.resetForm();
              patchState({
                token: response?.token,
                refreshToken: response?.refreshToken,
              });
              this.store.dispatch(
                new ToggleLoadingScreen({
                  showLoadingScreen: false,
                  message: '',
                })
              );
              this.store.dispatch(
                new ShowNotificationAction({
                  message:
                    'Registered successfully! Check your email inbox to activate your account before trying to log in.',
                  action: 'success',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
          },
          (error) => {
            console.error('There was an error ', error);
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'There was an error in submitting your form!',
                action: 'error',
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please make sure there are no errors in the form before attempting to submit!',
          action: 'error',
        })
      );
    }
  }

  @Action(VerifyAccountAction)
  verifyAccount(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: VerifyAccountAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { isSubmittingForm } = state;
    if (form.valid) {
      isSubmittingForm = true;
      const values = form.value;
      patchState({ isSubmittingForm });
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.VERIFY_ACCOUNT,
          variables: {
            token: values.token,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.verifyAccount;
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            console.log('got data', { data });
            if (response.success) {
              form.reset();
              formDirective.resetForm();
              this.store.dispatch(
                new ShowNotificationAction({
                  message: 'Account verified successfully!',
                  action: 'success',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
          },
          (error) => {
            console.error('There was an error ', error);
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'There was an error in submitting your form!',
                action: 'error',
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please make sure there are no errors in the form before attempting to submit!',
          action: 'error',
        })
      );
    }
  }

  @Action(ResendActivationEmailAction)
  resendActivationEmail(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: ResendActivationEmailAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { isSubmittingForm } = state;
    if (form.valid) {
      isSubmittingForm = true;
      const values = form.value;
      patchState({ isSubmittingForm });
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.RESEND_ACTIVATION_EMAIL,
          variables: {
            email: values.email,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.resendActivationEmail;
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            console.log('got data', { data });
            if (response.success) {
              form.reset();
              formDirective.resetForm();
              this.store.dispatch(
                new ShowNotificationAction({
                  message:
                    'Your activation email has been resent. Please check your email inbox.',
                  action: 'success',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
          },
          (error) => {
            console.error('There was an error ', error);
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'There was an error in submitting your form!',
                action: 'error',
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please make sure there are no errors in the form before attempting to submit!',
          action: 'error',
        })
      );
    }
  }

  @Action(SendPasswordResetEmailAction)
  sendPasswordResetEmail(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: SendPasswordResetEmailAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { isSubmittingForm } = state;
    if (form.valid) {
      isSubmittingForm = true;
      const values = form.value;
      patchState({ isSubmittingForm });
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.SEND_PASSWORD_RESET_EMAIL,
          variables: {
            email: values.email,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.sendPasswordResetEmail;
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            console.log('got data', { data });
            if (response.success) {
              form.reset();
              formDirective.resetForm();
              patchState({
                token: response?.token,
                refreshToken: response?.refreshToken,
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message:
                    'If you have an account with us, you should have received an email with instructions to reset your password. Please check your email inbox.',
                  action: 'success',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
          },
          (error) => {
            console.error('There was an error ', error);
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'There was an error in submitting your form!',
                action: 'error',
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please make sure there are no errors in the form before attempting to submit!',
          action: 'error',
        })
      );
    }
  }

  @Action(PasswordResetAction)
  passwordReset(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: PasswordResetAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { isSubmittingForm } = state;
    if (form.valid) {
      isSubmittingForm = true;
      const values = form.value;
      patchState({ isSubmittingForm });
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.PASSWORD_RESET,
          variables: {
            token: values.token,
            newPassword1: values.newPassword1,
            newPassword2: values.newPassword2,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.psswordReset;
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            console.log('got data', { data });
            if (response.success) {
              form.reset();
              formDirective.resetForm();
              this.store.dispatch(
                new ShowNotificationAction({
                  message: 'Password reset successfully!',
                  action: 'success',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
          },
          (error) => {
            console.error('There was an error ', error);
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'There was an error in submitting your form!',
                action: 'error',
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please make sure there are no errors in the form before attempting to submit!',
          action: 'error',
        })
      );
    }
  }

  @Action(PasswordChangeAction)
  passwordChange(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: PasswordChangeAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { isSubmittingForm } = state;
    if (form.valid) {
      isSubmittingForm = true;
      const values = form.value;
      patchState({ isSubmittingForm });
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.PASSWORD_CHANGE,
          variables: {
            oldPassword: values.oldPassword,
            newPassword1: values.newPassword1,
            newPassword2: values.newPassword2,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.passwordChange;
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            console.log('got data', { data });
            if (response.success) {
              form.reset();
              formDirective.resetForm();
              patchState({
                token: response?.token,
                refreshToken: response?.refreshToken,
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message: 'Password Changed successfully!',
                  action: 'success',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
          },
          (error) => {
            console.error('There was an error ', error);
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'There was an error in submitting your form!',
                action: 'error',
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please make sure there are no errors in the form before attempting to submit!',
          action: 'error',
        })
      );
    }
  }
}

const getExpiration = (token) => {
  const decodedToken: any = jwtDecode(token);
  console.log('decoded token => ', {
    decodedToken,
    exp: new Date(decodedToken.exp * 1000),
    origIat: new Date(decodedToken.origIat * 1000),
  });
  return decodedToken.exp;
};
