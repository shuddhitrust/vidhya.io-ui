import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { Observable } from 'rxjs';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { ActivatedRoute } from '@angular/router';
import {
  preventSpaces,
  sanitizeUsername,
} from 'src/app/shared/common/functions';
import { localStorageKeys } from 'src/app/shared/common/constants';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { AuthStateModel } from 'src/app/modules/auth/state/auth.model';
import {
  LoginAction,
  RegisterAction,
  ResendActivationEmailAction,
  SendPasswordResetEmailAction,
  SetAuthStorage,
  VerifyInvitecodeAction,
} from 'src/app/modules/auth/state/auth.actions';

const INVITECODE = 'INVITECODE';
const REGISTER = 'REGISTER';
const LOGIN = 'LOGIN';
const FORGOT_PASSWORD = 'FORGOT_PASSWORD';
const TROUBLE_SIGNING_IN = 'TROUBLE_SIGNING_IN';
const RESEND_ACTIVATION_EMAIL = 'RESEND_ACTIVATION_EMAIL';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {
  url: string;
  INVITECODE = INVITECODE;
  REGISTER = REGISTER;
  LOGIN = LOGIN;
  TROUBLE_SIGNING_IN = TROUBLE_SIGNING_IN;
  FORGOT_PASSWORD = FORGOT_PASSWORD;
  RESEND_ACTIVATION_EMAIL = RESEND_ACTIVATION_EMAIL;
  showDialog: string = LOGIN;
  loginForm: FormGroup;
  emailForm: FormGroup;
  invitecodeForm: FormGroup;
  registerForm: FormGroup;
  hide = true; // variable to store show/hide password toggle
  @Select(AuthState)
  authState$: Observable<AuthStateModel>;
  authState: AuthStateModel;
  invited: string;
  isLoggedIn: boolean = false;
  isSubmittingForm: boolean = false;
  closeLoginForm: boolean = false;
  rememberMe: boolean = JSON.parse(
    localStorage.getItem(localStorageKeys.REMEMBER_ME_KEY)
  );
  constructor(
    private store: Store,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LoginModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.setupLoginForm();
    this.setupForgotPasswordForm();
    this.setupRegisterForm();
    this.setupInvitecodeForm();
    this.authState$.subscribe((val) => {
      this.authState = val;
      this.invited = this.authState?.currentMember?.invitecode;
      this.isLoggedIn = this.authState?.isLoggedIn;
      if (this.isLoggedIn) {
        this.closeDialog();
      }
      this.isSubmittingForm = this.authState?.isSubmittingForm;
      if (
        this.closeLoginForm != this.authState?.closeLoginForm &&
        this.authState?.closeLoginForm
      ) {
        this.closeDialog();
      }
      // if (this.isLoggedIn) {
      //   this.closeDialog();
      // }
      if (this.invited && this.showDialog == INVITECODE) {
        this.showDialog = REGISTER;
      }
    });
  }

  preventSpaces($event) {
    return preventSpaces($event);
  }
  sanitizeUsername($event) {
    return sanitizeUsername($event);
  }
  ngOnInit() {
    this.url = window.location.href;
    if (this.url.includes(uiroutes.REGISTER_ROUTE.route) && !this.isLoggedIn) {
      const invitecode = this.url.split(uiroutes.REGISTER_ROUTE.route + '/')[1];
      this.route.queryParams.subscribe((params) => {
        const invitecode = params['invitecode'];
        if (invitecode) {
          this.showRegister();
          this.setupInvitecodeForm(invitecode);
        }
      });
    }
  }

  setupForgotPasswordForm() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  toggleAuthStorage(event) {
    this.store.dispatch(new SetAuthStorage({ remember: event.checked }));
  }
  setupLoginForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  setupInvitecodeForm(invitecode = '') {
    this.invitecodeForm = this.fb.group({
      invitecode: [
        invitecode,
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
      ],
    });
    if (this.invitecodeForm.get('invitecode').valid) {
      this.verifyInvitecode(this.invitecodeForm);
    }
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
    this.store.dispatch(new LoginAction({ form, formDirective }));
  }

  verifyInvitecode(form: FormGroup) {
    this.store.dispatch(new VerifyInvitecodeAction({ form }));
  }
  register(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(new RegisterAction({ form, formDirective }));
  }

  sendPasswordResetEmail(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(
      new SendPasswordResetEmailAction({ form, formDirective })
    );
  }

  sendAccountActivationEmail(
    form: FormGroup,
    formDirective: FormGroupDirective
  ) {
    this.store.dispatch(
      new ResendActivationEmailAction({ form, formDirective })
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

  showTroubleSigningIn() {
    this.showDialog = TROUBLE_SIGNING_IN;
  }

  showForgotPassword() {
    this.showDialog = FORGOT_PASSWORD;
  }

  showResendActivation() {
    this.showDialog = RESEND_ACTIVATION_EMAIL;
  }
}
