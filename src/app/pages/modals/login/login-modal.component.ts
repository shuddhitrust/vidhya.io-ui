import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { LoginAction } from 'src/app/shared/state/auth/auth.actions';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import Observable from 'zen-observable';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent {
  loginForm: FormGroup;
  hide = true; // variable to store show/hide password toggle
  @Select(AuthState.getIsLoggingIn)
  isLoggingIn$: Observable<boolean>;

  constructor(
    private store: Store,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LoginModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  login(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(new LoginAction({ form, formDirective }));
  }

  register() {
    console.log('I need to sign up');
  }

  forgotPassword() {
    console.log('I forgot password');
  }
}
