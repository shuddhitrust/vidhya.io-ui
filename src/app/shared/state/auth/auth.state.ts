import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { AuthStateModel, defaultAuthState } from './auth.model';

import { Injectable } from '@angular/core';
import {
  RegisterAction,
  LoginAction,
  VerifyAccountAction,
  ResendActivationEmailAction,
  SendPasswordResetEmailAction,
  PasswordResetAction,
  PasswordChangeAction,
} from './auth.actions';
import { ShowNotificationAction } from '../notifications/notification.actions';
import { Apollo } from 'apollo-angular';
import { AUTH } from '../../api/graphql/mutations.graphql';
import { getErrorMessageFromGraphQLResponse } from '../../common/functions';

@State<AuthStateModel>({
  name: 'authState',
  defaults: defaultAuthState,
})
@Injectable()
export class AuthState {
  constructor(private store: Store, private apollo: Apollo) {}

  @Selector()
  static getIsSubmittingForm(state: AuthStateModel): boolean {
    return state.isSubmittingForm;
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
      isSubmittingForm = true;
      const values = form.value;
      patchState({ isSubmittingForm });
      this.apollo
        .mutate({
          mutation: AUTH.REGISTER,
          variables: {
            username: values.username,
            email: values.email,
            password1: values.password1,
            password2: values.password2,
          },
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.resgister;
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
                new ShowNotificationAction({
                  message: 'Registered successfully!',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
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
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please fill all required fields before attempting to submit!',
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
          mutation: AUTH.VERIFY_ACCOUNT,
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
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
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
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please fill all required fields before attempting to submit!',
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
          mutation: AUTH.RESEND_ACTIVATION_EMAIL,
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
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
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
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please fill all required fields before attempting to submit!',
        })
      );
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
      isSubmittingForm = true;
      const values = form.value;
      patchState({ isSubmittingForm });
      this.apollo
        .mutate({
          mutation: AUTH.LOGIN,
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
              patchState({
                token: response?.token,
                refreshToken: response?.refreshToken,
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message: 'Logged in successfully!',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
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
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please fill all required fields before attempting to submit!',
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
          mutation: AUTH.SEND_PASSWORD_RESET_EMAIL,
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
                  message: 'Logged in successfully!',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
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
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please fill all required fields before attempting to submit!',
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
          mutation: AUTH.PASSWORD_RESET,
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
                  message: 'Password Changed successfully!',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
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
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please fill all required fields before attempting to submit!',
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
          mutation: AUTH.PASSWORD_CHANGE,
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
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
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
              })
            );
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please fill all required fields before attempting to submit!',
        })
      );
    }
  }
}
