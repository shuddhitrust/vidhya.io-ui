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

import {
  CreateUpdateInstitutionAction,
  GetInstitutionAction,
} from 'src/app/shared/state/institutions/institution.actions';
import { InstitutionState } from 'src/app/shared/state/institutions/institution.state';
import { Observable } from 'rxjs';
import { emptyInstitutionFormRecord } from 'src/app/shared/state/institutions/institution.model';
import { Institution } from 'src/app/shared/common/models';
import { UploadService } from 'src/app/shared/api/upload.service';
import { environment } from 'src/environments/environment';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';

@Component({
  selector: 'app-add-edit-institution',
  templateUrl: './add-edit-institution.component.html',
  styleUrls: [
    './add-edit-institution.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditInstitutionComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {};
  @Select(InstitutionState.getInstitutionFormRecord)
  institutionFormRecord$: Observable<Institution>;
  @Select(InstitutionState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  institutionFormRecord: Institution = emptyInstitutionFormRecord;
  institutionForm: FormGroup;
  logoFile = null;
  previewPath = null;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private uploadService: UploadService
  ) {
    this.institutionForm = this.setupInstitutionFormGroup();
    console.log('logo value', { logo: this.institutionForm.get('logo').value });
    this.institutionFormRecord$.subscribe((val) => {
      this.institutionFormRecord = val;
      this.institutionForm = this.setupInstitutionFormGroup(
        this.institutionFormRecord
      );
      this.previewPath = this.institutionForm.get('logo').value;
    });
  }

  setupInstitutionFormGroup = (
    institutionFormRecord: Institution = emptyInstitutionFormRecord
  ): FormGroup => {
    return this.fb.group({
      id: [institutionFormRecord.id],
      name: [institutionFormRecord.name, Validators.required],
      location: [institutionFormRecord.location, Validators.required],
      city: [institutionFormRecord.city, Validators.required],
      website: [institutionFormRecord.website],
      phone: [institutionFormRecord.phone],
      logo: [institutionFormRecord.logo],
      bio: [institutionFormRecord.bio],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetInstitutionAction({ id }));
      }
    });
  }

  onLogoChange(event) {
    if (event.target.files.length > 0) {
      this.logoFile = event.target.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewPath = reader.result as string;
      };
      reader.readAsDataURL(this.logoFile);
    } else {
      this.logoFile = null;
      this.previewPath = this.institutionForm.get('logo').value;
    }
  }

  goBack() {
    this.location.back();
  }

  imagePreview(e) {
    const file = (e.target as HTMLInputElement).files[0];
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    console.log('this.logoFile on submit', this.logoFile);
    if (this.logoFile) {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Uploading file',
        })
      );
      const formData = new FormData();
      formData.append('file', this.logoFile);
      this.uploadService.upload(formData).subscribe(
        (res) => {
          const url = `${environment.api_endpoint}${res.file}`;
          form.get('logo').setValue(url);
          console.log('after setting the new url after upload ', {
            formValue: form.value,
          });
          this.store.dispatch(
            new CreateUpdateInstitutionAction({ form, formDirective })
          );
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
        },
        (err) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: 'Unable to upload file. Reset and try again',
              action: 'error',
            })
          );
          return;
        }
      );
    } else {
      this.store.dispatch(
        new CreateUpdateInstitutionAction({ form, formDirective })
      );
    }
  }
}
