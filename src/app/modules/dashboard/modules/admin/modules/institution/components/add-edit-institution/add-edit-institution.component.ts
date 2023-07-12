import { Component, Inject, OnInit, Optional } from '@angular/core';
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
  ResetInstitutionFormAction,
} from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.actions';
import { FetchMembersByInstitutionAction } from '../../../member/state/member.actions';
import { MemberState } from '../../../member/state/member.state';
import { InstitutionState } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.state';
import { Observable } from 'rxjs';
import { emptyInstitutionFormRecord } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.model';
import { Institution, institutionTypeOptions, MatSelectOption,User } from 'src/app/shared/common/models';
import { UploadService } from 'src/app/shared/api/upload.service';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { sanitizeUsername } from 'src/app/shared/common/functions';
import { INSTITUTION_DESIGNATIONS } from 'src/app/shared/common/constants';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { USER_ROLES_NAMES } from 'src/app/shared/common/constants';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';


@Component({
  selector: 'app-add-edit-institution',
  templateUrl: './add-edit-institution.component.html',
  styleUrls: [
    './add-edit-institution.component.scss',
    './../../../../../../../../shared/common/shared-styles.css',
  ]
})
export class AddEditInstitutionComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {};
  @Select(InstitutionState.getInstitutionFormRecord)
  institutionFormRecord$: Observable<Institution>;
  institutionFormRecord: Institution = emptyInstitutionFormRecord;
  @Select(InstitutionState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(MemberState.listInstitutionMembers)
  coordinatorsRecord$: Observable<User[]>;
  institutionForm: FormGroup;
  logoFile = null;
  previewPath = null;
  institutionTypeOptions: MatSelectOption[] = institutionTypeOptions;
  coordinatorOptions:MatSelectOption[]=[]
  institutionDesignationsList: any = INSTITUTION_DESIGNATIONS;
  institutionModalData:any;
  isInstitutionModalDialog: any=false;
  columnFilters = {
    roles: [USER_ROLES_NAMES.INSTITUTION_ADMIN],
    institution_id:null
  };
  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private uploadService: UploadService,
    private auth: AuthorizationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.institutionModalData = data.newInstitutionDialog;
    this.isInstitutionModalDialog = this.institutionModalData?.isDialog
    this.institutionForm = this.setupInstitutionFormGroup();
    this.institutionFormRecord$.subscribe((val) => {      
      this.institutionFormRecord = val;
      this.institutionForm = this.setupInstitutionFormGroup(
        this.institutionFormRecord
      );
    });
    this.coordinatorsRecord$.subscribe((val)=>{
      for(let coordinator of val){        
        let optionObject:MatSelectOption={label:coordinator.name,value:coordinator.id}
        this.coordinatorOptions.push(optionObject)
      }
    })
  }

  setupInstitutionFormGroup = (
    institutionFormRecord: Institution = emptyInstitutionFormRecord
  ): FormGroup => {
    this.logoFile = null;
    this.previewPath = null;
    const formGroup = this.fb.group({
      id: [institutionFormRecord.id],
      name: [institutionFormRecord.name, Validators.required],
      code: [institutionFormRecord.code, Validators.required],      
      institutionType:[institutionFormRecord?.institutionType, Validators.required],
      designations:[institutionFormRecord.designations?institutionFormRecord.designations.toString():'NA', Validators.required],
      coordinator:[institutionFormRecord.coordinator?.id],
      verified:[institutionFormRecord.verified],
      location: [institutionFormRecord.location, Validators.required],
      city: [institutionFormRecord.city, Validators.required],
      website: [institutionFormRecord.website],
      phone: [institutionFormRecord.phone],
      logo: [institutionFormRecord.logo],
      bio: [institutionFormRecord.bio],
      address: [institutionFormRecord.address],
      state: [institutionFormRecord.state],
      pincode: [institutionFormRecord.pincode],
      dob: [moment(institutionFormRecord.dob)],
      country: [institutionFormRecord.country]
    });
    if(!formGroup.controls['designations'].value && formGroup.controls['institutionType'].value){
      let defaultDesignations = this.institutionTypeOptions.find(item=>item.value==formGroup.controls['institutionType'].value);
      formGroup.controls['designations'].setValue(this.institutionDesignationsList[defaultDesignations.label].toString());
    }

    this.previewPath = formGroup.get('logo').value;
    return formGroup;
  };
  ngOnInit(): void {
     this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetInstitutionAction({ id }));
        this.columnFilters.institution_id=id
      }
    });
    this.fetchMembers(new SearchParams())
  }

  sanitizeCode(event) {
    return sanitizeUsername(event);
  }

  onLogoChange(event) {
    if (event.target.files.length > 0) {
      this.logoFile = event.target.files[0];
      const fileValid = this.logoFile.type.startsWith('image/');
      if (fileValid) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewPath = reader.result as string;
        };
        reader.readAsDataURL(this.logoFile);
      } else {
        event.target.value = null;
        this.store.dispatch(
          new ShowNotificationAction({
            message: 'Please upload only images',
            action: 'error',
          })
        );
      }
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
          const url = res.secure_url;
          form.get('logo').setValue(url);
          this.store.dispatch(
            new CreateUpdateInstitutionAction({ form, formDirective,isInstitutionModalDialog:this.isInstitutionModalDialog })
          );
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
        },
        (err) => {
          this.store.dispatch(
            new ToggleLoadingScreen({ showLoadingScreen: false, message: '' })
          );
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
        new CreateUpdateInstitutionAction({ form, formDirective, isInstitutionModalDialog:this.isInstitutionModalDialog })
      );
    }
  }
  institutionTypeChange(e){
    let selectedType = this.institutionTypeOptions.find(item=>item.value==e);
    if(selectedType){
      let designationValue = this.institutionFormRecord.institutionType!=e?this.institutionDesignationsList[selectedType?.label]:this.institutionFormRecord.designations;
      this.institutionForm.controls['designations'].setValue(designationValue);
    }
  }
  
  coordinatorChange(e){
    this.institutionForm.controls['coordinator'].setValue(e);
    }

  fetchMembers(searchParams: SearchParams) {
      this.store.dispatch(
        new FetchMembersByInstitutionAction({
          searchParams: { ...searchParams, columnFilters: this.columnFilters },
        })
      );
    }

  isAuthorizedMember(){    
    return this.auth.currentMemberRoleName===USER_ROLES_NAMES.SUPER_ADMIN
  }
}
