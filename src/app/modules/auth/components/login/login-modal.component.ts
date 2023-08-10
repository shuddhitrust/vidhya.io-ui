import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  NgForm,
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
  GenerateEmailOTPAction,
  LoginAction,
  RegisterAction,
  ResendActivationEmailAction,
  ResetEmailVerificationParamsAction,
  SendPasswordResetEmailAction,
  SetAuthStorage,
  VerifyEmailOTPAction,
  VerifyInvitecodeAction,
} from 'src/app/modules/auth/state/auth.actions';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { DOCUMENT } from '@angular/common';
import { AuthConfig, OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';

const INVITECODE = 'INVITECODE';
const GENERATE_EMAIL_OTP = 'GENERATE_EMAIL_OTP';
const VERIFY_EMAIL_OTP = 'VERIFY_EMAIL_OTP';
const REGISTER = 'REGISTER';
const LOGIN = 'LOGIN';
const FORGOT_PASSWORD = 'FORGOT_PASSWORD';
const TROUBLE_SIGNING_IN = 'TROUBLE_SIGNING_IN';
const RESEND_ACTIVATION_EMAIL = 'RESEND_ACTIVATION_EMAIL';
const EMAIL_LOGIN = 'EMAIL_LOGIN';
declare global {
  const google: typeof import('google-one-tap');
}
const googleLogoURL = "./assets/images/google-SSO/Google.svg";
const authConfig: AuthConfig = environment.oAuthConfig;

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})

export class LoginModalComponent implements OnInit {
  url: string;
  INVITECODE = INVITECODE;
  GENERATE_EMAIL_OTP = GENERATE_EMAIL_OTP;
  VERIFY_EMAIL_OTP = VERIFY_EMAIL_OTP;
  REGISTER = REGISTER;
  LOGIN = LOGIN;
  TROUBLE_SIGNING_IN = TROUBLE_SIGNING_IN;
  FORGOT_PASSWORD = FORGOT_PASSWORD;
  RESEND_ACTIVATION_EMAIL = RESEND_ACTIVATION_EMAIL;
  EMAIL_LOGIN = EMAIL_LOGIN;
  registration: boolean = false;
  showDialog: string = LOGIN;
  loginForm: FormGroup;
  emailForm: FormGroup;
  invitecodeForm: FormGroup;
  registerForm: FormGroup;
  hide = true; // variable to store show/hide password toggle
  termsConditionsRoute: string = uiroutes.TERMS_CONDITIONS_ROUTE.route;
  termsAgreed: boolean = false;
  @Select(AuthState)
  authState$: Observable<AuthStateModel>;
  authState: AuthStateModel;
  invited: string;
  @Select(AuthState.getIsEmailVerified)
  isEmailVerified$:Observable<boolean>
  isEmailVerified: boolean = false;
  isEmailOTPGenerated: boolean = false;
  isLoggedIn: boolean = false;
  isSubmittingForm: boolean = false;
  closeLoginForm: boolean = false;
  loginFormDirective:FormGroupDirective
  rememberMe: boolean = JSON.parse(
    localStorage.getItem(localStorageKeys.REMEMBER_ME_KEY)
  );
  googleLogo: any = "btn_google_signin_dark_normal_web.png";
  registerDirective: FormGroupDirective;
  dialogUIStyle = new EventEmitter();
  showEmailLoginDialog: boolean=false;
  // @ViewChild('buttonDiv') buttonDiv: ElementRef = new ElementRef({});

  constructor(
    private store: Store,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LoginModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private oauthService: OAuthService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.configureSingleSignOn();
    this.matIconRegistry.addSvgIcon(
      "logo",
      this.domSanitizer.bypassSecurityTrustResourceUrl(googleLogoURL));
    this.setupLoginForm();
    this.setupForgotPasswordForm();
    this.setupRegisterForm();
    this.setupInvitecodeForm();
    this.isEmailVerified$.subscribe((val)=>{
      this.isEmailVerified=val;
      if(this.isEmailVerified===true){
        this.finalizeRegistration()
      }
    })
    this.authState$.subscribe((val) => {
      this.authState = val;
      // this.invited = this.authState?.currentMember?.invitecode;
      this.isEmailOTPGenerated = this.authState?.isEmailOTPGenerated;
      this.isEmailVerified = this.authState?.isEmailVerified;
      this.isLoggedIn = this.authState?.isLoggedIn;
      this.emailForm.get('email').setValue(this.authState?.verificationEmail);
      this.registerForm
        .get('email')
        .setValue(this.authState?.verificationEmail);
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
      if (this.registration) {
        this.showRegister();
      } else {
        this.showLogin();
      }
    });
  }

  configureSingleSignOn() {
    this.oauthService.configure(authConfig);
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
      otp: [''],
    });
  }
  toggleAuthStorage(event) {
    this.store.dispatch(new SetAuthStorage({ remember: event.checked }));
  }
  toggleTermsAgreed(event) {
    this.termsAgreed = !this.termsAgreed;
  }
  setupLoginForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.email,Validators.required]],
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
      username: [this.emailForm.get('email').value, Validators.required],
      email: [this.emailForm.get('email').value, Validators.required],
      password1: [this.emailForm.get('otp').value, Validators.required],
      password2: [this.emailForm.get('otp').value, Validators.required],
    });
  }

  resetEmailVerificationParams() {
    this.store.dispatch(new ResetEmailVerificationParamsAction());
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  login(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(new LoginAction({ form,formDirective }));
  }

  verifyInvitecode(form: FormGroup) {
    this.store.dispatch(new VerifyInvitecodeAction({ form }));
  }
  register(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(new RegisterAction({ form,formDirective }));
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
  initiateEmailVerification() {
    this.emailForm.get('email').setValue(null);
    this.resetEmailVerificationParams();
  }

  generateEmailOTP(form: FormGroup, formDirective: FormGroupDirective) {
    this.registerDirective = formDirective;
    this.store.dispatch(new GenerateEmailOTPAction({ form, formDirective }));
  }

  verifyEmailOTP(form: FormGroup, formDirective: FormGroupDirective) {
    this.loginFormDirective=formDirective
    this.store.dispatch(new VerifyEmailOTPAction({ form, formDirective }));
  }

  finalizeRegistration() {
    this.setupRegisterForm();
    this.register(this.registerForm,this.loginFormDirective);
  }

  showLogin() {
    this.registration = false;
    this.showDialog = LOGIN;
    this.dialogUIStyle.emit(this.showDialog);
  }

  showRegister() {
    this.registration = true;
    // if (this.invited) {
    if (this.isEmailVerified) {
      // this.showDialog = REGISTER;
      if (this.registerForm && !this.isSubmittingForm) {
        this.registration = false;
      }
    } else {
      if (this.isEmailOTPGenerated) {
        this.showDialog = VERIFY_EMAIL_OTP;
        this.dialogUIStyle.emit(this.showDialog);
        this.emailForm.controls['otp'].setValidators(Validators.required);
      } else {
        this.showDialog = GENERATE_EMAIL_OTP;
        this.dialogUIStyle.emit(this.showDialog);
      }
    }
    // } else {
    //   this.showDialog = INVITECODE;
    // }
  }

  showTroubleSigningIn() {
    this.showDialog = TROUBLE_SIGNING_IN;
    this.dialogUIStyle.emit(this.showDialog);
  }

  showForgotPassword() {
    this.showDialog = FORGOT_PASSWORD;
    this.dialogUIStyle.emit(this.showDialog);
  }

  showResendActivation() {
    this.showDialog = RESEND_ACTIVATION_EMAIL;
    this.dialogUIStyle.emit(this.showDialog);
  }

  showEmailLogin() {
    this.showDialog = EMAIL_LOGIN;
    this.dialogUIStyle.emit(this.showDialog);
  }
goBack(){
  this.showDialog = LOGIN;
  this.dialogUIStyle.emit(this.showDialog);

}
  openGoogleLogin(e) {
    this.oauthService.loadDiscoveryDocument()
      .then(() => this.oauthService.tryLogin())
      .then(() => {
        if (!this.oauthService.hasValidAccessToken()) {
          this.oauthService.initImplicitFlow();
        }
      });
  }
  ngOnDestroy(){
    console.log(this.showDialog);
    this.showDialog = LOGIN;
    this.registration = false;
    this.dialogUIStyle.emit(this.showDialog);
  }
}
