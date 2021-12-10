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
  CurrentMember,
  Issue,
  PreviewImage,
} from 'src/app/shared/common/models';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { IssueState } from '../../state/issue.state';
import { emptyIssueFormRecord } from '../../state/issue.model';
import {
  CreateUpdateIssueAction,
  GetIssueAction,
} from '../../state/issue.actions';
import { FetchCoursesAction } from '../../../../../course/state/courses/course.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { UploadService } from 'src/app/shared/api/upload.service';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';

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
  screenshotPreview: PreviewImage = { file: null, url: null };
  issueFormRecord: Issue = emptyIssueFormRecord;
  issueForm: FormGroup;
  description: string;
  screenshot: string;
  resourceTypeFromParams: string = null;
  resourceIdFromParams: string = null;
  linkFromParams: string = null;
  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private uploadService: UploadService
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

  // The method that gets the file from the input and queues it for upload
  addImageFileToIssue(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileValid = file.type.startsWith('image/');
      if (fileValid) {
        this.screenshotPreview.file = file;

        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          this.screenshotPreview.url = url;
        };
        reader.readAsDataURL(file);
      } else {
        event.target.value = null;
        this.store.dispatch(
          new ShowNotificationAction({
            message: 'Please upload only images',
            action: 'error',
          })
        );
      }
    }
  }

  // The method that actually uploads the file to the server and initiates the addition of the url to the submission
  async uploadImage(form, formDirective) {
    const file = this.screenshotPreview.file;
    if (file) {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Uploading your screenshot...',
        })
      );
      const formData = new FormData();
      formData.append('file', file);
      this.uploadService.upload(formData).subscribe(
        (res) => {
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
              message: '',
            })
          );
          this.screenshot = res.secure_url;
          this.submitForm(form, formDirective);
        },
        (err) => {
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
              message: '',
            })
          );
          this.store.dispatch(
            new ShowNotificationAction({
              message:
                'Something went wrong while uploading the reference images!',
              action: 'error',
            })
          );
        }
      );
    }
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    if (this.screenshotPreview.file && !this.screenshot) {
      this.uploadImage(form, formDirective);
    } else {
      form.get('description').setValue(this.description);
      if (this.screenshot) {
        form.get('screenshot').setValue(this.screenshot);
      }
      this.store.dispatch(new CreateUpdateIssueAction({ form, formDirective }));
    }
  }
}
