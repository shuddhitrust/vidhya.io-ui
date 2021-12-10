import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CurrentMember, Issue } from 'src/app/shared/common/models';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { IssueState } from '../../state/issue.state';
import { emptyIssueFormRecord } from '../../state/issue.model';
import {
  CreateUpdateIssueAction,
  GetIssueAction,
} from '../../state/issue.actions';
import { FetchCoursesAction } from '../../../../../course/state/courses/course.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';

export const ResourceTypeParamName = 'resourceType';
export const ResourceIdParamName = 'resourceId';
export const LinkParamName = 'link';

@Component({
  selector: 'app-add-edit-issue',
  templateUrl: './add-edit-issue.component.html',
  styleUrls: [
    './add-edit-issue.component.scss',
    './../../../../../../../../shared/common/shared-styles.css',
  ],
})
export class AddEditIssueComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {};
  @Select(IssueState.getIssueFormRecord)
  issueFormRecord$: Observable<Issue>;
  @Select(IssueState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  issueFormRecord: Issue = emptyIssueFormRecord;
  issueForm: FormGroup;
  description: string;
  resourceTypeFromParams: string = null;
  resourceIdFromParams: string = null;
  linkFromParams: string = null;
  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.issueForm = this.setupIssueFormIssue();

    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.issueFormRecord$.subscribe((val) => {
      this.issueFormRecord = val;
      this.issueForm = this.setupIssueFormIssue(this.issueFormRecord);
    });
  }
  guestForm() {
    return !this.currentMember?.id;
  }

  setupIssueFormIssue = (
    issueFormRecord: Issue = emptyIssueFormRecord
  ): FormGroup => {
    const reporterId = this.guestForm()
      ? null
      : issueFormRecord?.reporter?.id
      ? issueFormRecord?.reporter?.id
      : this.currentMember?.id;

    let reporterValidators = this.guestForm() ? [] : [Validators.required];
    let guestNameValidators = this.guestForm() ? [Validators.required] : [];
    let guestEmailValidators = [Validators.email];
    if (this.guestForm()) {
      guestEmailValidators.push(Validators.required);
    }

    const formIssue = this.fb.group({
      id: [issueFormRecord?.id],
      link: [issueFormRecord?.link, Validators.required],
      description: [issueFormRecord?.description, Validators.required],
      reporter: [reporterId, reporterValidators],
      resourceId: [issueFormRecord?.resourceId],
      resourceType: [issueFormRecord?.resourceType],
      guestName: [issueFormRecord?.guestName, guestNameValidators],
      guestEmail: [issueFormRecord?.guestEmail, guestEmailValidators],
      screenshot: [issueFormRecord?.screenshot],
      status: [issueFormRecord?.status],
      remarks: [issueFormRecord?.remarks],
    });
    this.setParamValuesToForm();
    this.description = formIssue.get('description').value;
    return formIssue;
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      this.resourceTypeFromParams = params[ResourceTypeParamName];
      this.resourceIdFromParams = params[ResourceIdParamName];
      this.linkFromParams = params[LinkParamName];
      this.setParamValuesToForm();
      if (id) {
        this.store.dispatch(new GetIssueAction({ id, fetchFormDetails: true }));
      }
    });
  }

  newIssue() {
    return !this.issueForm?.get('id')?.value;
  }

  setParamValuesToForm() {
    if (this.resourceTypeFromParams) {
      this.issueForm.get('resourceType').setValue(this.resourceTypeFromParams);
    }
    if (this.resourceIdFromParams) {
      this.issueForm.get('resourceId').setValue(this.resourceIdFromParams);
    }
    if (this.linkFromParams) {
      this.issueForm.get('link').setValue(this.linkFromParams);
    }
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    console.log('form upon submission', { form });
    form.get('description').setValue(this.description);
    this.store.dispatch(new CreateUpdateIssueAction({ form, formDirective }));
  }
}
