import { Component, OnInit } from '@angular/core';
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
import { PasswordResetAction } from 'src/app/shared/state/auth/auth.actions';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: [
    './password-reset.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class PasswordResetComponent implements OnInit {
  url: string;
  token: string;
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

  fetchTokenFromUrl() {
    if (this.isLoggedIn) {
      this.router.navigate(['']);
    } else {
      this.url = window.location.href;
      console.log('this.url => ', { url: this.url });
      if (this.router.url === uiroutes.PASSWORD_RESET_ROUTE.route) {
        console.log('account activation!!!');
        this.token = this.url.split(
          uiroutes.PASSWORD_RESET_ROUTE.route + '/'
        )[1];
      }
    }
  }

  goBack() {
    this.location.back();
  }

  setupPasswordResetForm() {
    this.passwordResetForm = this.fb.group({
      token: [this.token, Validators.required],
      password1: ['', Validators.required],
      password2: ['', Validators.required],
    });
  }

  resetPasswordForm(form: FormGroup, formDirective: FormGroupDirective) {
    console.log('register button was clicked');
    this.store.dispatch(new PasswordResetAction({ form, formDirective }));
  }

  ngOnInit(): void {
    this.fetchTokenFromUrl();
  }
}
