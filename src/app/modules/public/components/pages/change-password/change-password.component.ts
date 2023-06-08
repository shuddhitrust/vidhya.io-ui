import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { Router } from '@angular/router';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { PasswordChangeAction } from 'src/app/modules/auth/state/auth.actions';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  hide: boolean = true;
  passwordResetForm: FormGroup;
  @Select(AuthState.getIsSubmittingForm)
  isSubmittingForm$: Observable<boolean>;
  isSubmittingForm: boolean = false;
  @Select(AuthState.getIsLoggedIn)
  isLoggedIn$: Observable<boolean>;
  isLoggedIn: boolean;
  constructor(
    private location: Location,
    private store: Store,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.isLoggedIn$.subscribe((val) => {
      this.isLoggedIn = val;
    });
    this.setupPasswordResetForm();
  }

  setupPasswordResetForm() {
    this.passwordResetForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword1: ['', Validators.required],
      newPassword2: ['', Validators.required],
    });
  }

  resetPasswordForm(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(new PasswordChangeAction({ form, formDirective }));
  }
}