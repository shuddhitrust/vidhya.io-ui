import {
  State,
  Action,
  StateContext,
  Selector,
  Store,
  Select,
} from '@ngxs/store';
import { AuthStateModel, defaultAuthState } from './auth.model';
import {
  CurrentMember,
  MembershipStatusOptions,
  User,
  UserPermissions,
} from '../../common/models';

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
  CompleteLogoutAction,
  VerifyInvitecodeAction,
  AddInvitecodeAction,
  GetInstitutionByInvitecodeAction,
  UpdateCurrentUserInStateAction,
  OpenLoginFormAction,
  UpdateTokenAction,
} from './auth.actions';
import { ShowNotificationAction } from '../notifications/notification.actions';
import { Apollo } from 'apollo-angular';
import { AUTH_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { AUTH_QUERIES } from '../../api/graphql/queries.graphql';
import {
  constructPermissions,
  getErrorMessageFromGraphQLResponse,
} from '../../common/functions';
import {
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  minute,
} from '../../common/constants';
import jwtDecode from 'jwt-decode';
import { Observable } from 'rxjs';
import { ToggleLoadingScreen } from '../loading/loading.actions';
import { uiroutes } from '../../common/ui-routes';
import { Router } from '@angular/router';

/**
 * Auth flow steps:-
 * - When the application loads, it runs the AuthenticationCheckAction which looks for the token and refreshToken in localStorage
 * - If the token and refreshToken exist, it sets them both to state and calls the VerifyTokenAction to see if that token is valid.
 * - If the token is invalid, then it calls the RefreshTokenAction to see if the refreshToken is valid
 * - If the refreshToken is valid, it will store the token and the refreshToken in the state along with the expiryAt
 * and then check if the user's information is fetched.
 * - If it isn't in the state, it fetches the user's information. Otherwise not.
 * - If it is invalid, the user is shown the logged out state.
 * - If it is valid, ,
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
  constructor(
    private store: Store,
    private apollo: Apollo,
    private router: Router
  ) {
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
  static getToken(state: AuthStateModel): string {
    return state.token;
  }

  @Selector()
  static getPermissions(state: AuthStateModel): UserPermissions {
    return state.permissions;
  }

  @Selector()
  static getIsLoggedIn(state: AuthStateModel): boolean {
    return state.isLoggedIn;
  }
  @Selector()
  static getFirstTimeSetup(state: AuthStateModel): boolean {
    return state.firstTimeSetup;
  }
  @Selector()
  static getInvited(state: AuthStateModel): string {
    return state.currentMember?.invitecode;
  }
  @Selector()
  static getIsSubmittingForm(state: AuthStateModel): boolean {
    return state.isSubmittingForm;
  }
  @Selector()
  static getCurrentMember(state: AuthStateModel): CurrentMember {
    return state.currentMember;
  }
  @Selector()
  static getCurrentMemberStatus(state: AuthStateModel): string {
    return state.currentMember.membershipStatus;
  }
  @Selector()
  static getCurrentMemberInstitutionId(state: AuthStateModel): number {
    return state.currentMember?.institution?.id;
  }
  @Selector()
  static getCurrentUserId(state: AuthStateModel): number {
    return state.currentMember?.id;
  }

  @Action(UpdateTokenAction)
  updateToken(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: UpdateTokenAction
  ) {
    const state = getState();
    let { currentMember } = state;
    const { token, refreshToken } = payload;
    const { expiresAt, userId } = getDecodedToken(token);
    currentMember = { ...currentMember, id: userId };

    patchState({
      currentMember,
      expiresAt,
      token,
      refreshToken,
    });
    this.store.dispatch(new SetAuthSessionAction());
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
    if (localStorageToken && localStorageRefreshToken) {
      patchState({
        token: localStorageToken,
        refreshToken: localStorageRefreshToken,
      });
      this.store.dispatch(new VerifyTokenAction());
    } else {
      // Logging out
      this.store.dispatch(new CompleteLogoutAction());
    }
  }

  @Action(VerifyTokenAction)
  verifyToken({ getState, patchState }: StateContext<AuthStateModel>) {
    const state = getState();
    const { token, refreshToken } = state;
    let { currentMember } = state;
    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: true,
        message: 'Validating session...',
      })
    );
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
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
          console.log('data from verify token response ', {
            data,
            response,
            success: response.success,
          });
          if (response.success) {
            console.log('token verified successfully', { token });
            const { expiresAt, userId } = getDecodedToken(token);
            console.log('decodedToken');
            currentMember = { ...currentMember, id: userId };
            console.log('*1* Updating current member from verifyToken', {
              currentMember,
            });

            patchState({
              currentMember,
              expiresAt,
              isLoggedIn: true,
            });
            console.log({ state: getState() });
            if (!currentMember.username) {
              this.store.dispatch(new GetCurrentUserAction());
            }
          } else {
            this.store.dispatch(new RefreshTokenAction());
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

  @Action(RefreshTokenAction)
  refreshToken({ getState, patchState }: StateContext<AuthStateModel>) {
    const state = getState();
    console.log('calling refresh token method', { state });
    const { refreshToken, currentMember } = state;
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
              const { userId, expiresAt } = getDecodedToken(token);
              const currentMember = { ...state.currentMember, id: userId };
              this.store.dispatch(
                new UpdateTokenAction({ token, refreshToken })
              );

              patchState({
                expiresAt,
                isLoggedIn: true,
              });
              console.log({ state: getState() });
              if (!currentMember.username) {
                this.store.dispatch(new GetCurrentUserAction());
              }
            } else {
              this.store.dispatch(new CompleteLogoutAction());
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
  @Action(CompleteLogoutAction)
  completeLogout({ patchState }: StateContext<AuthStateModel>) {
    this.store.dispatch(
      new ToggleLoadingScreen({
        showLoadingScreen: false,
        message: '',
      })
    );
    // Marking user as logged out
    patchState(defaultAuthState);
    this.store.dispatch(new SetAuthSessionAction());
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
  }

  @Action(GetCurrentUserAction)
  getCurrentUser({ getState, patchState }: StateContext<AuthStateModel>) {
    const state = getState();
    const { isFetchingCurrentMember } = state;
    if (!isFetchingCurrentMember) {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Fetching user info...',
        })
      );
      patchState({ isFetchingCurrentMember: true });
      this.apollo.watchQuery({ query: AUTH_QUERIES.ME }).valueChanges.subscribe(
        ({ data }: any) => {
          patchState({ isFetchingCurrentMember: false });

          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
          console.log('***********From getCurrentUser => ', { data });
          const user = data.me;
          console.log(
            'initiating UpdateCurrentUserInStateAction from getCurrentUser'
          );
          this.store.dispatch(new UpdateCurrentUserInStateAction({ user }));
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetchingCurrentMember: false });
        }
      );
    }
  }

  @Action(UpdateCurrentUserInStateAction)
  updateCurrentUserInState(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: UpdateCurrentUserInStateAction
  ) {
    const { user } = payload;
    console.log('running UpdateCurrentUserInState', { user });
    const state = getState();
    const { isLoggedIn, currentMember } = state;
    const userPermissions = user?.role?.permissions?.toString()
      ? JSON.parse(user?.role?.permissions?.toString())
      : null;
    const permissions = constructPermissions(userPermissions);
    const newCurrentMember: CurrentMember = {
      id: user?.id ? user?.id : currentMember?.id,
      username: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      avatar: user?.avatar,
      invitecode: user?.invitecode,
      institution: {
        id: user?.institution?.id,
        name: user?.institution?.name,
      },
      membershipStatus: user?.membershipStatus,
      role: {
        name: user?.role?.name,
        permissions,
      },
    };
    console.log('newCurrentMember ', { currentMember: newCurrentMember });
    const firstTimeSetup = calculateFirstTiimeSetup(newCurrentMember);
    if (firstTimeSetup) {
      this.store.dispatch(
        new GetInstitutionByInvitecodeAction({
          currentMember: newCurrentMember,
        })
      );
    } else {
      const isFullyAuthenticated =
        isLoggedIn == true &&
        newCurrentMember?.membershipStatus == MembershipStatusOptions.APPROVED;
      console.log('*1* Updating current member from updateCurrentUserInState', {
        currentMember: newCurrentMember,
        isFullyAuthenticated,
        isLoggedIn,
      });
      patchState({
        isFullyAuthenticated,
        currentMember: newCurrentMember,
        permissions,
        firstTimeSetup,
      });
    }
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
              const token = response?.token;
              const refreshToken = response?.refreshToken;
              const { expiresAt, userId } = getDecodedToken(token);
              let user = response.user;
              user.id = userId;
              this.store.dispatch(
                new UpdateTokenAction({ token, refreshToken })
              );
              patchState({
                isLoggedIn: true,
                closeLoginForm: true,
                expiresAt,
                lastLogin: response?.user?.lastLogin,
              });
              this.store.dispatch(new UpdateCurrentUserInStateAction({ user }));
              this.store.dispatch(
                new ToggleLoadingScreen({
                  showLoadingScreen: false,
                  message: '',
                })
              );

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
          this.store.dispatch(new CompleteLogoutAction());
          // Clearing the refreshToken timeout
          clearTimeout(this.refreshTokenTimeout);
          // Marking user as logged out
          if (response.success) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Logged out successfully!',
                action: 'success',
              })
            );
            window.location.reload();
          }
        },
        (error) => {
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
          console.error('There was an error', error);
          this.store.dispatch(
            new ShowNotificationAction({
              message: 'There was an error in completing this action!',
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
    let state = getState();
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
      const email = values.email;
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
            this.store.dispatch(
              new ToggleLoadingScreen({
                showLoadingScreen: false,
                message: '',
              })
            );
            const response = data.register;
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            console.log('got data', { data });
            if (response?.success) {
              form.reset();
              formDirective.resetForm();
              const token = response?.token;
              const refreshToken = response?.refreshToken;
              this.store.dispatch(
                new UpdateTokenAction({ token, refreshToken })
              );
              patchState({
                closeLoginForm: true,
              });
              this.store.dispatch(new SetAuthSessionAction());
              state = getState();
              this.store.dispatch(
                new AddInvitecodeAction({
                  invitecode: state.currentMember?.invitecode,
                  email,
                })
              );
              // this.store.dispatch(new VerifyTokenAction());
              this.store.dispatch(
                new ShowNotificationAction({
                  message:
                    'Registered successfully! Check your email inbox to fully activate your account.',
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
            this.store.dispatch(
              new ToggleLoadingScreen({
                showLoadingScreen: false,
                message: '',
              })
            );
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
    const { token } = payload;
    let { isSubmittingForm } = state;
    isSubmittingForm = true;
    patchState({ isSubmittingForm });
    this.apollo
      .mutate({
        mutation: AUTH_MUTATIONS.VERIFY_ACCOUNT,
        variables: {
          token,
        },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.verifyAccount;
          isSubmittingForm = false;
          patchState({ isSubmittingForm });
          console.log('got data', { data });
          this.router.navigateByUrl(uiroutes.HOME_ROUTE.route);
          if (response.success) {
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Account verified successfully! Now you may login.',
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
          this.store.dispatch(
            new ShowNotificationAction({
              message:
                'There was an error in verifying your account. Please retry!',
              action: 'error',
            })
          );
        }
      );
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
              patchState({
                activationEmailSent: new Date(),
                closeLoginForm: true,
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message:
                    'If there is an account with this email ID, an email with further instructions should be delivered at this email ID. Please check.',
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
              const token = response?.token;
              const refreshToken = response?.refreshToken;
              this.store.dispatch(
                new UpdateTokenAction({ token, refreshToken })
              );
              patchState({
                closeLoginForm: true,
              });
              this.store.dispatch(new SetAuthSessionAction());
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
              const token = response?.token;
              const refreshToken = response?.refreshToken;
              this.store.dispatch(
                new UpdateTokenAction({ token, refreshToken })
              );
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

  @Action(VerifyInvitecodeAction)
  verifyInvitecode(
    { patchState, getState }: StateContext<AuthStateModel>,
    { payload }: VerifyInvitecodeAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { isSubmittingForm } = state;
    if (form.valid) {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Verifying Invite code...',
        })
      );
      isSubmittingForm = true;
      const invitecode = form.value.invitecode;
      console.log('invitecode after doing verify invite code ', { invitecode });
      patchState({
        isSubmittingForm,
      });
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.VERIFY_INVITECODE,
          variables: {
            invitecode,
          },
        })
        .subscribe(
          ({ data }: any) => {
            this.store.dispatch(
              new ToggleLoadingScreen({
                showLoadingScreen: false,
                message: '',
              })
            );
            const response = data.verifyInvitecode;
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            console.log('got data', { data });
            if (response?.ok) {
              form.reset();
              formDirective.resetForm();
              console.log('*1* Updating current member from verifyInviteCode', {
                currentMember: { ...state.currentMember, invitecode },
              });

              patchState({
                currentMember: { ...state.currentMember, invitecode },
              });
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response),
                  action: 'error',
                })
              );
            }
          },
          (error) => {
            console.error('There was an error ', error);
            this.store.dispatch(
              new ToggleLoadingScreen({
                showLoadingScreen: false,
                message: '',
              })
            );
            isSubmittingForm = false;
            patchState({ isSubmittingForm });
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(error),
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
  @Action(GetInstitutionByInvitecodeAction)
  getInstitutionByInvitecode(
    { patchState, getState }: StateContext<AuthStateModel>,
    { payload }: GetInstitutionByInvitecodeAction
  ) {
    let { currentMember } = payload;
    console.log(
      'Got currentMember from GetInstitutionByInvitecodeAction payload',
      { currentMember }
    );
    const invitecode = currentMember.invitecode;
    console.log('From GetInstitutionByInviteCodeAction', { invitecode });
    if (invitecode) {
      this.apollo
        .mutate({
          mutation: AUTH_QUERIES.GET_INSTITUTION_BY_INVITECODE,
          variables: {
            invitecode: currentMember.invitecode,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.institutionByInvitecode;
            console.log('got data GetInstitutionByInviteCodeAction', { data });

            currentMember = {
              ...currentMember,
              institution: { id: response?.id, name: response?.name },
            };
            console.log(
              '*1* Updating current member from updateCurrentUserInState',
              { currentMember }
            );
            patchState({
              currentMember,
              firstTimeSetup: true,
            });
          },
          (error) => {
            console.error('There was an error ', error);
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(error),
                action: 'error',
              })
            );
          }
        );
    }
  }

  @Action(AddInvitecodeAction)
  addInviteCode(
    { patchState, getState }: StateContext<AuthStateModel>,
    { payload }: AddInvitecodeAction
  ) {
    const state = getState();
    const { email } = payload;
    let { currentMember } = state;
    const invitecode = currentMember.invitecode;
    if (invitecode) {
      this.apollo
        .mutate({
          mutation: AUTH_MUTATIONS.ADD_INVITECODE,
          variables: {
            invitecode: currentMember.invitecode,
            email,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.addInvitecode;
            console.log('Added invitecode to User', { data });
          },
          (error) => {
            console.error('There was an error ', error);
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(error),
                action: 'error',
              })
            );
          }
        );
    }
  }

  @Action(OpenLoginFormAction)
  openLogiinForm({ patchState }: StateContext<OpenLoginFormAction>) {
    patchState({ closeLoginForm: false });
  }
}

const getDecodedToken = (token) => {
  const decodedToken: any = jwtDecode(token);
  console.log('decoded token => ', {
    decodedToken,
    exp: new Date(decodedToken.exp * 1000),
    origIat: new Date(decodedToken.origIat * 1000),
  });
  return {
    userId: decodedToken.sub.toString(),
    // userId: parseInt(decodedToken.sub, 10),
    expiresAt: decodedToken.exp,
  };
};

const calculateFirstTiimeSetup = (currentMember: CurrentMember): boolean => {
  const firstTimeSetup =
    currentMember?.membershipStatus == MembershipStatusOptions.UNINITIALIZED;
  console.log('firsttimesetup calculated => ', { firstTimeSetup });
  return firstTimeSetup;
};
