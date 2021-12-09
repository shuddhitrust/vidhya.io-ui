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
import {
  Course,
  CurrentMember,
  MatSelectOption,
  Issue,
} from 'src/app/shared/common/models';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { IssueState } from '../../state/issue.state';
import { emptyIssueFormRecord } from '../../state/issue.model';
import {
  CreateUpdateIssueAction,
  GetIssueAction,
} from '../../state/issue.actions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { CourseState } from '../../../../../course/state/courses/course.state';
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
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  issueFormRecord: Issue = emptyIssueFormRecord;
  issueForm: FormGroup;
  description: string;
  @Select(CourseState.listCourseOptions)
  courseOptions$: Observable<MatSelectOption[]>;
  resourceTypeFromParams: string = null;
  resourceIdFromParams: string = null;
  linkFromParams: string = null;
  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.fetchCourses();
    this.currentUserId$.subscribe((val) => {
      this.currentUserId = val;
    });
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });

    this.issueForm = this.setupIssueFormIssue();
    this.issueFormRecord$.subscribe((val) => {
      this.issueFormRecord = val;
      this.issueForm = this.setupIssueFormIssue(this.issueFormRecord);
    });
  }

  fetchCourses() {
    this.store.dispatch(
      new FetchCoursesAction({ searchParams: defaultSearchParams })
    );
  }

  setupIssueFormIssue = (
    issueFormRecord: Issue = emptyIssueFormRecord
  ): FormGroup => {
    const formIssue = this.fb.group({
      id: [issueFormRecord?.id],
      link: [issueFormRecord?.link, Validators.required],
      description: [issueFormRecord?.description, Validators.required],
      reporter: [
        issueFormRecord?.reporter?.id
          ? issueFormRecord?.reporter?.id
          : this.currentUserId,
        Validators.required,
      ],
      resourceId: [issueFormRecord?.resourceId],
      resourceType: [issueFormRecord?.resourceType],
      guestName: [issueFormRecord?.guestName],
      guestEmail: [issueFormRecord?.guestEmail],
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
    form.get('description').setValue(this.description);
    this.store.dispatch(new CreateUpdateIssueAction({ form, formDirective }));
  }
}
