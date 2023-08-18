import { Component, Inject, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
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
import { FetchCoordinatorsByInstitution } from 'src/app/shared/state/options/options.actions';
import { MemberState } from '../../../member/state/member.state';
import { InstitutionState } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.state';
import { Observable, Subject, of } from 'rxjs';
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
import { map, takeUntil } from 'rxjs/operators';
import { OptionsState } from 'src/app/shared/state/options/options.state';


@Component({
  selector: 'app-add-edit-institution',
  templateUrl: './add-edit-institution.component.html',
  styleUrls: [
    './add-edit-institution.component.scss',
    './../../../../../../../../shared/common/shared-styles.css',
  ]
})
export class AddEditInstitutionComponent implements OnInit, OnDestroy {
  formSubmitting: boolean = false;
  coordinatorName:string = '';
  params: object = {};
  @Select(InstitutionState.getInstitutionFormRecord)
  institutionFormRecord$: Observable<Institution>;
  institutionFormRecord: Institution = emptyInstitutionFormRecord;
  @Select(InstitutionState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(InstitutionState.isInstitutionModalDialog)
  isInstitutionModalDialog$: Observable<boolean>;
  @Select(OptionsState.listInstitutionCoordinatorMembers)
  coordinatorsRecord$: Observable<User[]>;
  institutionForm: FormGroup;
  logoFile = null;
  previewPath = null;
  institutionTypeOptions: MatSelectOption[] = institutionTypeOptions;
  coordinatorOptions:any=[];
  institutionDesignationsList: any = INSTITUTION_DESIGNATIONS;
  institutionModalData:any;
  isInstitutionModalDialog: any=false;
  columnFilters = {
    roles: [USER_ROLES_NAMES.INSTITUTION_ADMIN,USER_ROLES_NAMES.SUPER_ADMIN],
    name:null
  };
  today = new Date();
  filteredCoordinatorOptions$: Observable<any>;
  @ViewChild('autoInput') autoInput;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private uploadService: UploadService,
    private auth: AuthorizationService,
    @Optional()  @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddEditInstitutionComponent>
    ) {
    this.institutionModalData = data?.newInstitutionDialog;
    this.isInstitutionModalDialog = this.institutionModalData?.isDialog
    this.institutionForm = this.setupInstitutionFormGroup();
    this.institutionFormRecord$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {      
      this.institutionFormRecord = val;
      this.institutionForm = this.setupInstitutionFormGroup(
        this.institutionFormRecord
      );
    });
    this.isInstitutionModalDialog$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val)=>{
      if(val){
        this.dialogRef.close({data: val})
        this.store.dispatch(new ResetInstitutionFormAction());
      }
    });
    this.coordinatorsRecord$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val)=>{
      this.coordinatorOptions = val;
      const institutionOptionsObservable$ = of(this.coordinatorOptions);
      this.filteredCoordinatorOptions$ = institutionOptionsObservable$.pipe(map((number) => number));   
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
      public:[institutionFormRecord.public],
      author:[institutionFormRecord.id ? institutionFormRecord.author?.id:this.auth.currentMember.id],
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
    if(institutionFormRecord?.coordinator?.id && this.autoInput?.nativeElement){
      this.autoInput.nativeElement.value=this.institutionFormRecord.coordinator.name;
    }
    this.previewPath = formGroup.get('logo').value;
    return formGroup;
  };

  ngOnInit(): void {
     this.route.queryParams
     .pipe(takeUntil(this.destroy$))
     .subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetInstitutionAction({ id }));
      }
    });
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
      this.uploadService.upload(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
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

  isAuthorizedMember(){    
    return this.auth.currentMemberRoleName===USER_ROLES_NAMES.SUPER_ADMIN
  }

   /******************
    * Autocomplete Coordinator
    * ***************/
  filterCoordinator(event: any) {
    if (event) {
      let searchParams=new SearchParams();
      this.columnFilters =Object.assign({},this.columnFilters,{'name': event.target.value.toLowerCase()});
      this.filteredCoordinatorOptions$ = of([]).pipe(map((item) => item));
      this.coordinatorOptions = [];
      this.fetchMembers(searchParams);
    }
  }

  displayFn(user) {
    return user && user?.name ? user?.name : '';
  }
  
  fetchMembers(searchParams: SearchParams) {
    this.store.dispatch(
      new FetchCoordinatorsByInstitution({
        searchParams: { ...searchParams, columnFilters: this.columnFilters },
      })
    );
  }
  /****************
   * END OF AUTOCOMPLETE
   * **************/

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
