import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormGroupDirective,
} from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';

import {
  CreateUpdateAnnouncementAction,
  GetAnnouncementAction,
} from 'src/app/modules/dashboard/modules/announcement/state/announcement.actions';
import { AnnouncementState } from 'src/app/modules/dashboard/modules/announcement/state/announcement.state';
import { Observable } from 'rxjs';
import { emptyAnnouncementFormRecord } from 'src/app/modules/dashboard/modules/announcement/state/announcement.model';
import {
  Announcement,
  CurrentMember,
  MatSelectOption,
} from 'src/app/shared/common/models';
import {
  defaultSearchParams,
  USER_ROLES_NAMES,
} from 'src/app/shared/common/constants';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { FetchAdminGroupOptions } from 'src/app/shared/state/options/options.actions';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { ImageDisplayDialog } from 'src/app/shared/components/image-display/image-display-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { UploadService } from 'src/app/shared/api/upload.service';
import { Clipboard } from '@angular/cdk/clipboard';
@Component({
  selector: 'app-add-edit-announcement',
  templateUrl: './add-edit-announcement.component.html',
  styleUrls: [
    './add-edit-announcement.component.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
})
export class AddEditAnnouncementComponent implements OnInit {
  formSubmitting: boolean = false;
  recipientsGlobal = 'recipientsGlobal';
  recipientsInstitution = 'recipientsInstitution';
  public = 'public';
  groups = 'groups';
  params: object = {};
  images: string[] = [];
  uploadingImages: boolean = false;
  message: string = '';
  @Select(AnnouncementState.getAnnouncementFormRecord)
  announcementFormRecord$: Observable<Announcement>;
  @Select(OptionsState.listAdminGroupOptions)
  groupOptions$: Observable<MatSelectOption[]>;
  @Select(AnnouncementState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(AuthState.getCurrentMemberInstitutionId)
  currentMemberInstitutionId$: Observable<number>;
  currentMemberInstitutionId: number = 1;
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  announcementFormRecord: Announcement = emptyAnnouncementFormRecord;
  announcementForm: FormGroup;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private uploadService: UploadService,
    public clipboard: Clipboard
  ) {
    this.store.dispatch(new FetchAdminGroupOptions());
    this.currentUserId$.subscribe((val) => {
      this.currentUserId = val;
    });
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.announcementFormRecord$.subscribe((val) => {
      this.announcementFormRecord = val;
      this.announcementForm = this.setupAnnouncementFormGroup(
        this.announcementFormRecord
      );
    });
    this.announcementForm = this.setupAnnouncementFormGroup();
  }

  setupAnnouncementFormGroup = (
    announcementFormRecord: Announcement = emptyAnnouncementFormRecord
  ): FormGroup => {
    return this.fb.group({
      id: [announcementFormRecord?.id],
      author: [
        announcementFormRecord?.author?.id
          ? announcementFormRecord?.author?.id
          : this.currentUserId,
        Validators.required,
      ],
      title: [announcementFormRecord?.title, Validators.required],
      institution: [
        announcementFormRecord.institution?.id
          ? announcementFormRecord.institution?.id
          : this.currentMemberInstitutionId,
        Validators.required,
      ],
      public: [announcementFormRecord?.public, Validators.required],
      image: [announcementFormRecord?.image],
      blurb: [announcementFormRecord?.blurb],
      message: [announcementFormRecord?.message, Validators.required],
      [this.recipientsGlobal]: [
        this.announcementFormRecord?.[this.recipientsGlobal],
      ],
      [this.recipientsInstitution]: [
        this.announcementFormRecord?.[this.recipientsInstitution],
      ],
      [this.groups]: [announcementFormRecord?.[this.groups]],
    });
  };

  // The method that actually uploads the file to the server and initiates the addition of the url to the submission
  async uploadImage(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Uploading image...',
        })
      );
      const formData = new FormData();
      formData.append('file', file);
      this.uploadService.upload(formData).subscribe(
        (res) => {
          const url = res.secure_url;
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
              message: '',
            })
          );
          // We update the images in the response form with the new array
          this.images.push(url);
          // and also add the link to the image in the message
          this.pushImageToMessage(url);
        },
        (err) => {
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
              message: '',
            })
          );
          this.uploadingImages = false;
          this.store.dispatch(
            new ShowNotificationAction({
              message: 'Something went wrong while uploading the image!',
              action: 'error',
            })
          );
        }
      );
    }
  }

  // When a new image is uploaded, we add it to the message at the bottom
  pushImageToMessage(url) {
    this.message = this.message.concat(
      `<br /><img src="${url}" alt="image ${this.images.length}" width="100%" height="auto" /><br /><br />

`
    );
  }

  showExpandedImage(image) {
    const dialogRef = this.dialog.open(ImageDisplayDialog, {
      data: {
        image,
      },
    });
    this.clipboard.copy(image);
    this.store.dispatch(
      new ShowNotificationAction({
        message: 'Image URL copied to clipboard!',
        action: 'success',
      })
    );
    dialogRef.afterClosed().subscribe((result) => {});
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(
          new GetAnnouncementAction({ id, fetchFormDetails: true })
        );
      }
    });
  }

  showPublic() {
    return this.currentMember.role.name == USER_ROLES_NAMES.SUPER_ADMIN;
  }

  isPublic() {
    return this.announcementForm.get('public').value;
  }

  recipientsChanged(field) {
    if (field != this.recipientsGlobal) {
      this.announcementForm.get(this.recipientsGlobal).setValue(false);
    }
    if (field != this.recipientsInstitution) {
      this.announcementForm.get(this.recipientsInstitution).setValue(false);
    }
    if (field != this.groups) {
      this.announcementForm.get(this.groups).setValue([]);
    }
  }

  goBack() {
    this.location.back();
  }

  validateRecipients() {
    let result = false;
    if (this.announcementForm.get(this.recipientsGlobal).value == true) {
      result = true;
    }
    if (this.announcementForm.get(this.recipientsInstitution).value == true) {
      result = true;
    }
    if (this.announcementForm.get(this.public).value == true) {
      result = true;
    }
    if (this.announcementForm.get(this.groups).value.length > 0) {
      result = true;
    }
    return result;
  }

  ShowGlobalRecipients() {
    return this.currentMember.role?.name == USER_ROLES_NAMES.SUPER_ADMIN;
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    form.get('message').setValue(this.message);
    if (this.validateRecipients()) {
      this.store.dispatch(
        new CreateUpdateAnnouncementAction({
          form,
          formDirective,
        })
      );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message: 'Please specify recipients',
          action: 'error',
        })
      );
    }
  }
}
