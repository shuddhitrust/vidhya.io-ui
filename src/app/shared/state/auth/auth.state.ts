import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { AuthStateModel, defaultAuthState } from './auth.model';

import { Injectable } from '@angular/core';
import { LoginAction } from './auth.actions';
import { ShowNotificationAction } from '../notifications/notification.actions';
<<<<<<< HEAD
import { Apollo } from 'apollo-angular';
import { LOGIN } from '../../api/graphql/mutations.graphql';
import { getErrorMessageFromGraphQLResponse } from '../../common/functions';
=======
>>>>>>> 15f5f394940554a3cd671c24b0d8208ab7b6c831

@State<AuthStateModel>({
  name: 'authState',
  defaults: defaultAuthState,
})
@Injectable()
export class AuthState {
<<<<<<< HEAD
  constructor(private store: Store, private apollo: Apollo) {}
=======
  constructor(private store: Store) {}
>>>>>>> 15f5f394940554a3cd671c24b0d8208ab7b6c831

  @Selector()
  static getIsLoggingIn(state: AuthStateModel): boolean {
    return state.isLoggingIn;
  }

  @Action(LoginAction)
  forceRefetchInstitutions(
    { getState, patchState }: StateContext<AuthStateModel>,
    { payload }: LoginAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { isLoggingIn } = state;
    if (form.valid) {
      isLoggingIn = true;
      const values = form.value;
      patchState({ isLoggingIn });
      this.apollo
        .mutate({
          mutation: LOGIN,
          variables: {
            username: values.username,
            password: values.password,
          },
          errorPolicy: 'all',
        })
        .subscribe(
          ({ data }: any) => {
            isLoggingIn = false;
            patchState({ isLoggingIn });
            console.log('got data', { data });
            if (data.tokenAuth.success) {
              form.reset();
              formDirective.resetForm();
              this.store.dispatch(
                new ShowNotificationAction({
                  message: 'Logged in successfully!',
                })
              );
            } else {
              console.log(
                'data.tokenAuth.errors.nonFieldErrors[0].message',
                data.tokenAuth.errors.nonFieldErrors[0].message
              );
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(
                    data?.tokenAuth?.errors
                  ),
                })
              );
            }
          },
          (error) => {
            console.error('There was an error ', error);
            isLoggingIn = false;
            patchState({ isLoggingIn });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'There was an error in submitting your form!',
              })
            );
          }
        );
      // client
      //   .mutate({
      //     mutation: updateForm
      //       ? mutations.UpdateInstitution
      //       : mutations.CreateInstitution,
      //     variables: {
      //       input: values,
      //     },
      //   })
      //   .then((res: any) => {
      //     this.store.dispatch(new ForceRefetchInstitutions({}));
      //     formSubmitting = false;
      //     patchState({ institutionFormRecord: emptyInstitutionFormRecord });
      //     form.reset();
      //     formDirective.resetForm();
      //     patchState({ formSubmitting });
      //     this.store.dispatch(
      //       new ShowNotificationAction({
      //         message: 'Form submitted successfully!',
      //       })
      //     );
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //     formSubmitting = false;
      //     patchState({ formSubmitting });
      //     this.store.dispatch(
      //       new ShowNotificationAction({
      //         message: 'There was an error in submitting your form!',
      //       })
      //     );
      //   });
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
