import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { AuthStateModel, defaultAuthState } from './auth.model';

import { Injectable } from '@angular/core';
import { LoginAction } from './auth.actions';
import { ShowNotificationAction } from '../notifications/notification.actions';

@State<AuthStateModel>({
  name: 'authState',
  defaults: defaultAuthState,
})
@Injectable()
export class AuthState {
  constructor(private store: Store) {}

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
