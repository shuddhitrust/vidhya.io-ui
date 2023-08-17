import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CreateUpdateMemberAction,
  GetMemberAction,
} from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.actions';
import { searchInstitution, FetchDesignationByInstitution } from 'src/app/shared/state/options/options.actions';
import { MemberState } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.state';
import { Observable, Subject, from, of } from 'rxjs';
import { emptyMemberFormRecord } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';
import { InstitutionState } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.state';
import { MatSelectOption, User, institutionTypeOptions, genderOptions } from 'src/app/shared/common/models';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { OptionsStateModel } from 'src/app/shared/state/options/options.model';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { UploadService } from 'src/app/shared/api/upload.service';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { AuthState } from '../../state/auth.state';
import { AuthStateModel } from '../../state/auth.model';
import { INSTITUTION_DESIGNATIONS } from 'src/app/shared/common/constants';
import { map, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AddEditInstitutionComponent } from 'src/app/modules/dashboard/modules/admin/modules/institution/components/add-edit-institution/add-edit-institution.component';
import { ChangePasswordComponent } from 'src/app/modules/public/components/pages/change-password/change-password.component';
import { SendPasswordResetEmailAction } from '../../state/auth.actions';
import moment from 'moment';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ResetInstitutionFormAction } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.actions';

@Component({
  selector: 'app-add-edit-member',
  templateUrl: './add-edit-member.component.html',
  styleUrls: [
    './add-edit-member.component.scss',
    './../../../../shared/common/shared-styles.css',
  ]
})
export class AddEditMemberComponent implements OnInit, OnDestroy {

  formDirective: FormGroupDirective;
  panelOpenState: boolean = false;
  formSubmitting: boolean = false;
  public selectedIndex: number = 0;
  memberFormTab = ['']
  params: object = {}; // URL Params
  @Select(InstitutionState.listInstitutionOptions)
  institutionOptions$: Observable<MatSelectOption[]>;
  institutionOptions: any = [];
  tableTitle: any = INSTITUTION_DESIGNATIONS;
  @Select(InstitutionState.isFetching)
  isFetchingInstitutions$: Observable<boolean>;
  isFetchingInstitutions: boolean;
  @Select(MemberState.getMemberFormRecord)
  memberFormRecord$: Observable<User>;
  memberFormRecord: User = emptyMemberFormRecord;
  @Select(MemberState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(AuthState)
  authState$: Observable<AuthStateModel>;
  authState: AuthStateModel;
  isFullyAuthenticated: boolean;
  createForm: boolean;
  memberForm: FormGroup;
  isFetchingGroups: boolean;
  @Select(OptionsState.listClassesByInstitution)
  groupOptions$: Observable<MatSelectOption[]>;
  groupOptions: MatSelectOption[];
  @Select(OptionsState.listInstitutionOptions)
  institutionList$: Observable<MatSelectOption[]>;
  institutionList: MatSelectOption[]
  @Select(OptionsState.listDesignationsByInstitutionsOptions)
  designationsList$: Observable<any>;
  @Select(OptionsState)
  optionsState$: Observable<OptionsStateModel>;
  optionsState: OptionsStateModel;
  groupInstitutionId: string;
  firstTimeSetup: boolean;
  currentMember: User;
  // Validation Constants
  titleMaxLength = 60;
  bioMaxLength = 150;
  updateForm: boolean = false;
  avatarFile = null;
  previewPath = null;
  formName: string = 'profile';
  designationOptions: any = [];
  institutionTypeOptions: MatSelectOption[] = institutionTypeOptions;
  genderOptions: MatSelectOption[] = genderOptions;
  isGoogleLoggedIn: boolean = false;
  isManualLogIn: boolean = false;
  filteredInstitutionOptions$: Observable<any>;
  filterValue: string;
  @ViewChild('autoInput') autoInput;
  maxDob: Date;
  submitBtnName: string = 'Submit';
  @ViewChild('dialogTemplate', { static: true }) dialogTemplate: TemplateRef<any>;
  memberFormContactDirective: any;
  memberFormContact: any;
  invalidFields: any = [];
  memberShipStatus: string;
  windowOriginUrl:any = window.location.origin;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private uploadService: UploadService,
    public dialog: MatDialog,
    public cdr: ChangeDetectorRef,
  ) {
    this.dobDateValidation()
    this.institutionList$
    .pipe(takeUntil(this.destroy$))
    .subscribe(options => {
      if (options) {
        this.institutionOptions = options;
        const institutionOptionsObservable$ = of(this.institutionOptions);
        this.filteredInstitutionOptions$ = institutionOptionsObservable$.pipe(map((number) => number));
        if (this.memberForm && this.memberForm.controls['institution'].get('institution').value) {
          if (!this.autoInput.nativeElement.value) {
            this.autoInput.nativeElement.value = this.currentMember?.institution?.name;
          }
        }
      }
    })
    this.designationsList$
    .pipe(takeUntil(this.destroy$))
    .subscribe(val => {
      this.designationOptions = val;
    })

    this.authState$    
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.authState = val;
      this.isFullyAuthenticated = this.authState?.isFullyAuthenticated;
      this.currentMember = this.authState?.currentMember;
      this.firstTimeSetup = this.authState?.firstTimeSetup;
      this.isGoogleLoggedIn = this.authState?.isGoogleLoggedIn;
      this.isManualLogIn = this.authState?.isManualLogIn;
      this.memberShipStatus = this.authState?.memberShipStatus;
      this.currentMember = {
        id: this.currentMember?.id,
        username: this.currentMember?.username,
        firstName: this.currentMember?.firstName,
        lastName: this.currentMember?.lastName,
        email: this.currentMember?.email,
        avatar: this.currentMember?.avatar,
        title: this.currentMember?.title,
        bio: this.currentMember?.bio,
        dob: this.currentMember?.dob,
        gender: this.currentMember?.gender,
        address: this.currentMember?.address,
        city: this.currentMember?.city,
        pincode: this.currentMember?.pincode,
        state: this.currentMember?.state,
        country: this.currentMember?.country,
        mobile: this.currentMember?.mobile,
        phone: this.currentMember?.phone,
        designation: this.currentMember?.designation,
        manualLogin: this.currentMember?.manualLogin,
        googleLogin: this.currentMember?.googleLogin,
        institution: {
          id: this.currentMember?.institution?.id,
          name: this.currentMember?.institution?.name,
          institutionType: this.currentMember?.institution?.institutionType,
          verified: this.currentMember?.institution?.verified,
          coordinator: {
            id: this.currentMember?.institution?.coordinator?.id,
            name: this.currentMember?.institution?.coordinator?.name,
            email: this.currentMember?.institution?.coordinator?.email,
            mobile: this.currentMember?.institution?.coordinator?.mobile
          }
        },
        role: {
          name: this.currentMember?.role?.name,
          permissions: this.currentMember?.role?.permissions,
        },
      };
      this.memberForm = this.setupMemberFormGroup(this.currentMember);
      if (this.firstTimeSetup) {
        this.store.dispatch(
          new ShowNotificationAction({
            message:
              'Please fill this form and submit before being able to browse the application.',
            action: 'show',
          })
        );
      } else {
        this.optionsState$
        .pipe(takeUntil(this.destroy$))
        .subscribe((val: OptionsStateModel) => {
          this.optionsState = val;
          this.isFetchingGroups = val.isFetchingAdminGroups;
        });
        this.groupOptions$
        .pipe(takeUntil(this.destroy$))
        .subscribe((val) => {
          this.groupOptions = val;
        });
      }
    });
    if (!this.memberForm) {
      this.memberForm = this.setupMemberFormGroup();
      if (this.memberForm && this.memberForm.controls['institution'].get('institution').value) {
        if (this.autoInput && !this.autoInput.nativeElement?.value) {
          this.autoInput.nativeElement.value = this.currentMember?.institution?.name;
        }
      }
    }
    this.checkIfFormContainsRecord();
  }

  dobDateValidation() {
    const today = new Date();
    this.maxDob = new Date(
      today.getFullYear() - 10,
      today.getMonth(),
      today.getDate()
    );
  }

  checkIfFormContainsRecord() {
    this.updateForm = this.memberFormRecord.id != null;
  }

  setupMemberFormGroup = (
    memberFormRecord: User = emptyMemberFormRecord
  ): FormGroup => {
    this.avatarFile = null;
    this.previewPath = null;
    let validDobDate = moment(new Date(memberFormRecord?.dob)).isBefore(this.maxDob, 'day') || moment(new Date(memberFormRecord?.dob)).isSame(this.maxDob, 'day'); // false
   
    /***********************************************************
     * 
     * !!!!IMPORTANT INFO:
     * Add all the required field form name 
     * to processMemberFormValid method in home.component.ts 
     * To the array variable requiredField
     * 
     * ************************* *************************************/
    const formGroup = this.fb.group({
      id: [memberFormRecord?.id],
      profile: this.fb.group({
        firstName: [memberFormRecord?.firstName, [Validators.required]],
        lastName: [memberFormRecord?.lastName, [Validators.required]],
        dob: [validDobDate ? (memberFormRecord?.dob ? moment(memberFormRecord?.dob) : null) : null],
        gender:[memberFormRecord?.gender,[Validators.required]],
        avatar: [memberFormRecord?.avatar],
        title: [
          memberFormRecord?.title,
          Validators.maxLength(this.titleMaxLength),
        ],
        bio: [memberFormRecord?.bio, Validators.maxLength(this.bioMaxLength)]
      }),
      contact: this.fb.group({
        email: [memberFormRecord?.email],
        address: [memberFormRecord?.address],
        city: [memberFormRecord?.city],
        pincode: [memberFormRecord?.pincode],
        state: [memberFormRecord?.state == "NA" ? '' : memberFormRecord?.state, [Validators.required]],
        country: [memberFormRecord?.country, Validators.required],
        mobile: [memberFormRecord?.mobile == "0000000000" ? '' : memberFormRecord?.mobile],
        phone: [memberFormRecord?.phone == "0000000000" ? '' : memberFormRecord?.phone]
      }),
      institution: this.fb.group({
        designation: [memberFormRecord?.designation ? memberFormRecord?.designation : '', [Validators.required]],
        institution: [memberFormRecord?.institution?.id ? memberFormRecord?.institution?.id : '', [Validators.required]]
      }),
      accountSetting: this.fb.group({
        username: [memberFormRecord.email == memberFormRecord.username ? '' : memberFormRecord.username, [Validators.minLength(5), Validators.maxLength(16), Validators.required]]
      })
    });

    if (memberFormRecord?.institution?.id) {
      this.store.dispatch(new searchInstitution({ name: memberFormRecord?.institution.name }));
      this.store.dispatch(new FetchDesignationByInstitution({ id: memberFormRecord?.institution.id }));
    }

    this.previewPath = formGroup.get('profile').get('avatar').value;
    formGroup.get('contact').get('email').disable();
    let regexStr = '^[a-zA-Z0-9_.]*$';

    if (formGroup.controls['accountSetting'].get('username').value && new RegExp(regexStr).test(formGroup.controls['accountSetting'].get('username').value)
    ) {
      formGroup.get('accountSetting').get('username').disable();
    } else {
      if (formGroup.controls['accountSetting'].get('username').value) {
        formGroup.get('accountSetting').get('username').markAsTouched();
        formGroup.get('accountSetting').get('username').markAsDirty();
        formGroup.get('accountSetting').get('username').setErrors({ 'incorrect': true });
      }
    }
    if (formGroup.controls['contact'].get('email').value != null) {
      if (this.firstTimeSetup != true && formGroup.valid == false) {
        (Object as any).values(formGroup.controls).forEach((control: any) => {
          if (control.status == "INVALID") {
            (Object as any).values(control.controls).forEach((elem: any) => {
              if (!elem.valid) {
                elem.markAsTouched();
                elem.markAsDirty();
              }
            })
          }
        })
        this.submitBtnName = 'Complete Registration';
      } else {
        this.submitBtnName = 'Submit';
      }
    }
    return formGroup;
  };

  public findInvalidControls(formGroup) {
    if (formGroup) {
      const controls = formGroup.controls;
      this.invalidFields = [];
      let count = 0;
      this.formDirective;
      for (const name in controls) {
        if (name != 'id') {
          for (let elem in controls[name].controls) {
            if (controls[name].controls[elem].invalid && (controls[name].controls[elem].dirty || controls[name].controls[elem].touched || this.formDirective?.submitted)) {
              let camelToFlat = (elem = elem.replace(/[A-Z]/g, " $&"), elem[0].toUpperCase() + elem.slice(1));
              this.invalidFields.push(camelToFlat);
            }
          }
        }
      }
      return this.invalidFields;
    }
  }

  ngOnInit(): void {
    this.route.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetMemberAction({ id }));
      }
    });
  }

  get registerFormControl() {
    this.findInvalidControls(this.memberForm);
    return this.memberForm.controls;
  }

  ngAfterViewInit() {
    if (!this.autoInput.nativeElement.value && this.currentMember?.institution?.name) {
      this.autoInput.nativeElement.value = this.currentMember?.institution?.name;
    }
    this.cdr.detectChanges();
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  onAvatarChange(event) {
    if (event.target.files.length > 0) {
      this.avatarFile = event.target.files[0];
      const fileValid = this.avatarFile.type.startsWith('image/');
      if (fileValid) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewPath = reader.result as string;
        };
        reader.readAsDataURL(this.avatarFile);
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
      this.avatarFile = null;
      this.previewPath = this.memberForm.get('avatar').value;
    }
  }

  goBack() {
    this.location.back();
  }

  imagePreview(e) {
    const file = (e.target as HTMLInputElement).files[0];
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    if (form.invalid) {
      this.formDirective = formDirective;
      this.findInvalidControls(this.memberForm);
      setTimeout(() => {
        const element = document.querySelector('#scrollId');
        element.scrollIntoView();
      }, 100);
    } else {
      if (this.avatarFile) {
        this.store.dispatch(
          new ToggleLoadingScreen({
            showLoadingScreen: true,
            message: 'Uploading file',
          })
        );
        const formData = new FormData();
        formData.append('file', this.avatarFile);
        this.uploadService.upload(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res) => {
            const url = res.secure_url;
            form.get('profile').get('avatar').setValue(url);
            this.store.dispatch(
              new CreateUpdateMemberAction({
                form,
                formDirective,
                username: this?.currentMember?.username
              })
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
          new CreateUpdateMemberAction({
            form,
            formDirective,
            username: this?.currentMember?.email
          })
        );
      }
    }
  }

  selectInstitution(e) {
    let institution = e;
    if (institution) {
      this.designationOptions = [];
      this.store.dispatch(new FetchDesignationByInstitution({ id: institution?.id }));
      if (institution?.name != this.currentMember?.institution?.name) {
        this.memberForm.controls['institution'].get('designation').setValue('');
      } else if (institution?.name == this.currentMember?.institution?.name) {
        this.memberForm.controls['institution'].get('designation').setValue(this.currentMember.designation);
      }
    }
  }

  addNewInstitution(e) {
    this.store.dispatch(new ResetInstitutionFormAction());
    const dialogRef = this.dialog.open(AddEditInstitutionComponent, {
      height: '80%',
      data: {
        newInstitutionDialog: {
          isDialog: true
        }
      }
    });
    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.institutionOptions = [{ id: result?.data?.id, name: result?.data?.name, institutionType: result?.data?.institutionType }];
        this.filteredInstitutionOptions$ = of(this.institutionOptions).pipe(map((item) => item));
        this.designationOptions = result.data.designations ? result.data.designations.split(',') : ['NA'];
        Object.keys(this.currentMember.institution).forEach(elem => {
          this.currentMember.institution[elem] = result.data[elem]
        })
        this.memberForm.controls['institution'].get('institution').setValue(result.data);
        if (this.memberForm && this.memberForm.controls['institution'].get('institution').value) {
          if (!this.autoInput.nativeElement.value) {
            this.autoInput.nativeElement.value = this.currentMember?.institution?.name;
          }
        }
      }
    });
  }

  //Change Password & Reset password
  passwordUpdate(form, formDirective) {
    if (this.isManualLogIn) {
      let dialogName = ChangePasswordComponent;
      const dialogRef = this.dialog.open(dialogName);
      dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => { });
    } else {
      this.memberFormContactDirective = formDirective;
      this.memberFormContact = form;
      const dialogRef = this.dialog.open(this.dialogTemplate);
    }
  }

  resetPassword() {
    let form = this.memberFormContact;
    let formDirective = this.memberFormContactDirective;
    this.store.dispatch(new SendPasswordResetEmailAction({ form, formDirective }));
    this.dialog.closeAll();
  }

  //Institution autocomplete 
  filterInstitution(event: any) {
    if (event) {
      this.memberForm.controls['institution'].get('designation').setValue('');
      this.institutionOptions = []
      this.designationOptions = [];
      this.filteredInstitutionOptions$ = of([]).pipe(map((item) => item));
      this.filterValue = event.target.value.toLowerCase();
      if (this.filterValue.length >= 3) {
        this.store.dispatch(new searchInstitution({ name: this.filterValue }));
      }
    }
  }

  displayFn(user) {
    return user?.name;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}