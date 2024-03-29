import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { Router } from '@angular/router';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { PasswordChangeAction } from 'src/app/modules/auth/state/auth.actions';
import { AuthStateModel } from 'src/app/modules/auth/state/auth.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnDestroy{
  hide: boolean = true;
  passwordResetForm: FormGroup;
  @Select(AuthState.getIsSubmittingForm)
  isSubmittingForm$: Observable<boolean>;
  isSubmittingForm: boolean = false;
  @Select(AuthState.getIsLoggedIn)
  isLoggedIn$: Observable<boolean>;
  isLoggedIn: boolean;
  @Select(AuthState)
  authState$: Observable<AuthStateModel>;
  firstTimeSetup: any;
  authState: AuthStateModel;
  @Select(AuthState.getFirstTimeSetup)
  firstTimeSetup$: Observable<any>;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private location: Location,
    private store: Store,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.isLoggedIn$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isLoggedIn = val;
    });
    
    this.isSubmittingForm$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isSubmittingForm = val;
    })
    this.authState$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isSubmittingForm = val?.isSubmittingForm;
    })
    this.firstTimeSetup$
    .pipe(takeUntil(this.destroy$))
    .subscribe((status) => {
      if (status) {
        this.firstTimeSetup = status?.firstTimeSetup;      
      }
    })
    this.setupPasswordResetForm();
    if(this.firstTimeSetup == true){
      this.passwordResetForm.controls['oldPassword'].setValue(localStorage.getItem('EMAIL_OTP')?localStorage.getItem('EMAIL_OTP'):sessionStorage.getItem('EMAIL_OTP')?sessionStorage.getItem('EMAIL_OTP'):'');
    }
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}