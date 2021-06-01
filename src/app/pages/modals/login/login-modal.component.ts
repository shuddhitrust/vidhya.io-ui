import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
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
import {
  LoginAction,
  RegisterAction,
  SendPasswordResetEmailAction,
  VerifyInvitecodeAction,
} from 'src/app/shared/state/auth/auth.actions';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { Observable } from 'rxjs';

const INVITECODE = 'INVITECODE';
const REGISTER = 'REGISTER';
const LOGIN = 'LOGIN';
const FORGOT_PASSWORD = 'FORGOT_PASSWORD';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent {
  INVITECODE = INVITECODE;
  REGISTER = REGISTER;
  LOGIN = LOGIN;
  FORGOT_PASSWORD = FORGOT_PASSWORD;
  showDialog: string = LOGIN;
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  invitecodeForm: FormGroup;
  registerForm: FormGroup;
  hide = true; // variable to store show/hide password toggle
  @Select(AuthState.getIsSubmittingForm)
  isSubmittingForm$: Observable<boolean>;
  @Select(AuthState.getIsLoggedIn)
  isLoggedIn$: Observable<boolean>;
  @Select(AuthState.getInvited)
  invited$: Observable<boolean>;
  invited: boolean;
  isLoggedIn: boolean = false;

  constructor(
    private store: Store,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LoginModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.setupLoginForm();
    this.setupForgotPasswordForm();
    this.setupRegisterForm();
    this.setupInvitecodeForm();
    this.invited$.subscribe((val) => {
      this.invited = val;
      if (this.invited && this.showDialog == INVITECODE) {
        this.showDialog = REGISTER;
      }
    });
    this.isLoggedIn$.subscribe((val) => {
      this.isLoggedIn = val;
      if (this.isLoggedIn) {
        this.closeDialog();
      }
    });
  }

  setupForgotPasswordForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  setupLoginForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  setupInvitecodeForm() {
    this.invitecodeForm = this.fb.group({
      invitecode: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
      ],
    });
  }

  setupRegisterForm() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password1: ['', Validators.required],
      password2: ['', Validators.required],
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  login(form: FormGroup, formDirective: FormGroupDirective) {
    console.log('login button is clicked!');
    this.store.dispatch(new LoginAction({ form, formDirective }));
  }

  verifyInvitecode(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(new VerifyInvitecodeAction({ form, formDirective }));
  }

  register(form: FormGroup, formDirective: FormGroupDirective) {
    console.log('register button was clicked');
    this.store.dispatch(new RegisterAction({ form, formDirective }));
  }

  sendPasswordResetEmail(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(
      new SendPasswordResetEmailAction({ form, formDirective })
    );
  }

  showLogin() {
    this.showDialog = LOGIN;
  }

  showRegister() {
    if (this.invited) {
      this.showDialog = REGISTER;
    } else {
      this.showDialog = INVITECODE;
    }
  }

  showForgotPassword() {
    this.showDialog = FORGOT_PASSWORD;
  }
}
