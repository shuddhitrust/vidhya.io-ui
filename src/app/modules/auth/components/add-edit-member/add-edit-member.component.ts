import { Component, EventEmitter, OnInit, Output, ViewChild,ChangeDetectorRef } from '@angular/core';
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
import { FetchInstitutionsByNameOptions, FetchInstitutionsOptions } from 'src/app/shared/state/options/options.actions';
import { MemberState } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.state';
import { Observable, from, of } from 'rxjs';
import { emptyMemberFormRecord } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';
import { InstitutionState } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.state';
import { InstitutionStateModel } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.model';
import { MatSelectOption, User, institutionTypeOptions } from 'src/app/shared/common/models';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { OptionsStateModel } from 'src/app/shared/state/options/options.model';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { UploadService } from 'src/app/shared/api/upload.service';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { AuthState } from '../../state/auth.state';
import { AuthStateModel } from '../../state/auth.model';
import { INSTITUTION_DESIGNATIONS, defaultSearchParams } from 'src/app/shared/common/constants';
import { FetchInstitutionsAction } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.actions';
import { debounceTime, filter, flatMap, map, startWith } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AddEditInstitutionComponent } from 'src/app/modules/dashboard/modules/admin/modules/institution/components/add-edit-institution/add-edit-institution.component';
import { PasswordResetComponent } from 'src/app/modules/public/components/pages/password-reset/password-reset.component'
import { ChangePasswordComponent } from 'src/app/modules/public/components/pages/change-password/change-password.component';
import { SendPasswordResetEmailAction } from '../../state/auth.actions';
import moment from 'moment';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-add-edit-member',
  templateUrl: './add-edit-member.component.html',
  styleUrls: [
    './add-edit-member.component.scss',
    './../../../../shared/common/shared-styles.css',
  ],

})
export class AddEditMemberComponent implements OnInit {
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
  institutionOptionList: any = [];
  newPasswordBtnName: any = 'Change Password';
  isGoogleLoggedIn: boolean = false;
  isManualLogIn: boolean = false;
  filteredOptions$: Observable<any>;
  filterValue: string;
  institutionName: any = '';
  @ViewChild('autoInput') autoInput;
  maxDob: Date;
  submitBtnName: string = 'Submit';


  // @Output() optionSelected = new EventEmitter<MatAutocompleteSelectedEvent>();

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private uploadService: UploadService,
    public dialog: MatDialog,
    public cdr:ChangeDetectorRef
  ) {
    const today = new Date();
    this.maxDob = new Date(
      today.getFullYear() - 10,
      today.getMonth(),
      today.getDate()
    );
    this.institutionList$.subscribe(options => {
      if (options) {
        this.institutionOptionList = options;
        this.institutionOptions = options;//[this.memberForm.get('institution').get('institutionType').value];
        const institutionOptionsObservable$ = of(this.institutionOptions);
        this.filteredOptions$ = institutionOptionsObservable$.pipe(map((number) => number));
        if (this.memberForm && this.memberForm.controls['institution'].get('institution').value) {
          if (!this.autoInput.nativeElement.value) {
            this.autoInput.nativeElement.value = this.currentMember?.institution?.name;
          }
          this.designationOptions = this.currentMember?.institution?.designations?.split(',')
        }
      }
    })
    this.authState$.subscribe((val) => {
      this.authState = val;
      this.isFullyAuthenticated = this.authState?.isFullyAuthenticated;
      this.currentMember = this.authState?.currentMember;
      this.firstTimeSetup = this.authState?.firstTimeSetup;
      this.isGoogleLoggedIn = this.authState?.isGoogleLoggedIn;
      this.isManualLogIn = this.authState?.isManualLogIn;
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
          designations: this.currentMember?.institution?.designations,
        },
        role: {
          name: this.currentMember?.role?.name,
          permissions: this.currentMember?.role?.permissions,
        },
      };

      this.memberForm = this.setupMemberFormGroup(this.currentMember);
      if (this.memberForm && this.memberForm.controls['institution'].get('institution').value) {
        if (this.autoInput && !this.autoInput?.nativeElement?.value) {
          this.autoInput.nativeElement.value = this.currentMember?.institution?.name;
        }
        this.designationOptions = this.currentMember?.institution?.designations?.split(',')
      }

      this.populateInstitution();
      if (this.firstTimeSetup) {
        this.store.dispatch(
          new ShowNotificationAction({
            message:
              'Please fill this form and submit before being able to browse the application.',
            action: 'show',
          })
        );
      } else {
        this.optionsState$.subscribe((val: OptionsStateModel) => {
          this.optionsState = val;
          this.isFetchingGroups = val.isFetchingAdminGroups;
        });
        this.groupOptions$.subscribe((val) => {
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
        this.designationOptions = this.currentMember?.institution?.designations?.split(',')
      }
    }
    this.checkIfFormContainsRecord();
  }

  selectInstitution(e, institution) {
    this.institutionName = institution.name;
    this.memberForm.controls['institution'].get('institution').setValue(institution.id);
    this.designationOptions = institution.designations ? institution.designations.split(',') : ['NA'];
    if (institution?.name != this.currentMember?.institution?.name) {
      this.memberForm.controls['institution'].get('designation').setValue('');
    } else if (institution?.name == this.currentMember?.institution?.name) {
      this.memberForm.controls['institution'].get('designation').setValue(this.currentMember.designation);

    }

  }

  checkIfFormContainsRecord() {
    this.updateForm = this.memberFormRecord.id != null;
  }

  setupMemberFormGroup = (
    memberFormRecord: User = emptyMemberFormRecord
  ): FormGroup => {
    this.avatarFile = null;
    this.previewPath = null;
    let currentDate = moment([new Date().getFullYear(), new Date().getMonth(), new Date().getDate()]);
    let dobDate = moment([new Date(memberFormRecord?.dob).getFullYear(), new Date(memberFormRecord?.dob).getMonth(), new Date(memberFormRecord?.dob).getDate()]);
    let dobDateDiff = currentDate.diff(dobDate, 'days');
    const formGroup = this.fb.group({
      id: [memberFormRecord?.id],
      profile: this.fb.group({
        firstName: [memberFormRecord?.firstName, Validators.required],
        lastName: [memberFormRecord?.lastName, Validators.required],
        dob: [dobDateDiff > 0 ? moment(memberFormRecord?.dob) : null, Validators.required],
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
        state: [memberFormRecord?.state],
        country: [memberFormRecord?.country, Validators.required],
        mobile: [memberFormRecord?.mobile == "0000000000" ? '' : memberFormRecord?.mobile, Validators.required],
        phone: [memberFormRecord?.phone == "0000000000" ? '' : memberFormRecord?.phone]
      }),
      institution: this.fb.group({
        // institutionType: [memberFormRecord?.institution.institutionType || this.institutionTypeOptions[0].value],
        designation: [memberFormRecord?.designation, Validators.required],
        institution: [memberFormRecord?.institution?.id, Validators.required]
      }),
      accountSetting: this.fb.group({
        username: [memberFormRecord.email == memberFormRecord.username ? '' : memberFormRecord.username, [Validators.minLength(5), Validators.maxLength(16), Validators.required]]
      })
    });
    if (memberFormRecord?.institution?.name) {
      this.designationOptions = memberFormRecord?.institution?.designations ? memberFormRecord?.institution?.designations.split(',') : ['NA'];
      this.store.dispatch(new FetchInstitutionsByNameOptions({ name: memberFormRecord?.institution.name }));
    }
    this.previewPath = formGroup.get('profile').get('avatar').value;
    this.institutionName = memberFormRecord?.institution?.name;
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
    this.newPasswordBtnName = this.isManualLogIn ? 'Change Password' : 'Reset Password';
    if(formGroup.controls['contact'].get('email').value!=null){      
      if(this.firstTimeSetup!=true && formGroup.valid==false){
        this.submitBtnName = 'Complete Registration';
      }else{
        this.submitBtnName = 'Submit';
      }
    }
    return formGroup;
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetMemberAction({ id }));
      }
    });
  }

  ngAfterViewInit(){
    if (!this.autoInput.nativeElement.value) {
      this.autoInput.nativeElement.value = this.currentMember?.institution?.name;
    }
    this.cdr.detectChanges();
  }

  populateInstitution() {
    this.memberForm.get('institution')
      .get('institution')
      .setValue(this.currentMember?.institution?.id);
    this.institutionOptions = [
      {
        value: this.currentMember?.institution?.id,
        label: this.currentMember?.institution?.name,
      },
    ];
    if (this.currentMember?.institution?.institutionType) {
      this.designationOptions = this.currentMember?.institution?.designations.split(',');
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
  onScroll() {
    console.log('scrolled!!');
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

  onTabChange(e) {
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    if (this.avatarFile) {
      this.store.dispatch(
        new ToggleLoadingScreen({
          showLoadingScreen: true,
          message: 'Uploading file',
        })
      );
      const formData = new FormData();
      formData.append('file', this.avatarFile);
      this.uploadService.upload(formData).subscribe(
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
  getPosts(e) {
  }
  addNewInstitution(e) {
    const dialogRef = this.dialog.open(AddEditInstitutionComponent, {
      height: '80%',
      data: {
        newInstitutionDialog: {
          // type: this.memberForm.get('institution').get('institutionType').value,
          isDialog: true
        }
      }
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  passwordUpdate(form, formDirective) {
    if (this.isManualLogIn) {
      let dialogName = ChangePasswordComponent;
      const dialogRef = this.dialog.open(dialogName);
      dialogRef.afterClosed().subscribe((result) => { });
    } else {
      this.store.dispatch(
        new SendPasswordResetEmailAction({ form, formDirective })
      );
    }
  }

  displayFn(user) {
    this.institutionName = user && user?.name ? user?.name : '';
    return user?.name;
  }

  private _filter(name: string) {
    this.filterValue = name.toLowerCase();
    return this.store.dispatch(new FetchInstitutionsByNameOptions({ name: name }));
  }
  getData(searchText: string) {
    return searchText.length < 3 ? of(this.institutionOptions = []) :
      this._filter(searchText)
  }
  filter(event: any) {
    if (event) {
      this.memberForm.controls['institution'].get('institution').setValue('');
      this.filteredOptions$ = this.getData(event.target.value);
    }
  }
}