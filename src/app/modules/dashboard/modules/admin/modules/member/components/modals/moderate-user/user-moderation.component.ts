import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  MembershipStatusOptions,
  resources,
  RESOURCE_ACTIONS,
  User,
  UserRole,
  MatSelectOption,
  institutionTypeOptions,
} from 'src/app/shared/common/models';
import {
  ApproveMemberAction,
  GetMemberAction,
  ModifyUserInstitutionAction,
  SuspendMemberAction,
} from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.actions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { UserRoleState } from '../../../../user-role/state/userRole.state';
import { FetchUserRolesAction } from '../../../../user-role/state/userRole.actions';
import { searchInstitution, FetchDesignationByInstitution } from 'src/app/shared/state/options/options.actions';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { map } from 'rxjs/operators';
import { InstitutionState } from '../../../../institution/state/institutions/institution.state';
import { emptyMemberFormRecord } from '../../../state/member.model';
import { MemberState } from '../../../state/member.state';

@Component({
  selector: 'app-user-moderation-profile',
  templateUrl: './user-moderation.component.html',
  styleUrls: [
    './user-moderation.component.scss',
    './../../../../../../../../../shared/common/shared-styles.css',
  ],
})
export class UserModerationProfileComponent implements OnInit {
  resource = resources.MODERATION;
  resourceActions = RESOURCE_ACTIONS;
  profileData: any = {};
  moderationForm: FormGroup;
  @Select(UserRoleState.listRoleOptions)
  roleOptions$: Observable<UserRole[]>;
  roleOptions;
  @Select(UserRoleState.isFetching)
  isFetchingUserRoles$: Observable<boolean>;
  isFetchingUserRoles: boolean;  
  @Select(OptionsState.listInstitutionOptions)
  institutionList$: Observable<MatSelectOption[]>;
  institutionList: MatSelectOption[]
  institutionOptions: any = [];
  filteredInstitutionOptions$: Observable<any>;
  @Select(InstitutionState.listInstitutionOptions)
  institutionOptions$: Observable<MatSelectOption[]>;
  institutionTypeOptions: MatSelectOption[] = institutionTypeOptions;
  filterValue: any;  
  @Select(OptionsState.listDesignationsByInstitutionsOptions)
  designationsList$: Observable<any>;
  designationOptions: any = [];
  @ViewChild('autoInput') autoInput;
  @Select(MemberState.getMemberFormRecord)
  memberFormRecord$: Observable<User>;
  // memberFormRecord: User = emptyMemberFormRecord;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<UserModerationProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private store: Store,
    private fb: FormBuilder,
    private auth: AuthorizationService
  ) {
    this.roleOptions$.subscribe((val) => {
      this.roleOptions = val;
    });
    this.memberFormRecord$.subscribe((val) => {
      if(val && val?.username){        
        console.log(this.profileData);
        this.profileData = val;
      }
    })

    this.institutionList$.subscribe(options => {
      if (options) {
        this.institutionOptions = options;
        const institutionOptionsObservable$ = of(this.institutionOptions);
        this.filteredInstitutionOptions$ = institutionOptionsObservable$.pipe(map((number) => number));
        if (this.moderationForm && this.moderationForm.controls['institution'].value) {
          if (!this.autoInput.nativeElement.value) {
            this.autoInput.nativeElement.value = this.profileData?.institution?.name;
          }
        }
      }
    })
    
    this.designationsList$.subscribe(val => {
      this.designationOptions = val;
    })
  this.profileData = data;
  this.store.dispatch(new GetMemberAction({ id:this.profileData.id}));

  console.log(this.profileData);
    this.moderationForm = this.setupModerationFormGroup(this.profileData);
  }

  ngOnInit() {
    this.store.dispatch(
      new FetchUserRolesAction({ searchParams: defaultSearchParams })
    );
    this.store.dispatch(new searchInstitution({ name:this.profileData?.institution?.name}));
    this.store.dispatch(new FetchDesignationByInstitution({ id: this.profileData?.institution?.id }));


  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      institutionId: this.profileData?.institution?.id,
    });
  }

  disableApproval() {
    return (
      this.profileData?.membershipStatus ==
      MembershipStatusOptions.UNINITIALIZED
    );
  }

  setupModerationFormGroup = (user): FormGroup => {
    const formGroup = this.fb.group({
      role: [user?.role?.name],
      remarks: [],
      institution:[user?.institution],
      designation:[user?.designation]
    });
    return formGroup;
  };

  closeDialog(): void {
    this.dialogRef.close();
  }

  modifyInstitutionConfirmation(){
    debugger;
    const institutionValue = this.moderationForm.get('institution').value;
    if(institutionValue) {
      const dialogRef = this.dialog.open(UserInstitutionChangeConfirmationDialog, {
        data: JSON.stringify({'profileData':this.profileData,'currentinstitution':this.moderationForm.getRawValue().institution})
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result == true) {
          this.modifyInstitution();
        }
      });
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message: 'Please add a remark before attempting to deny.',
          action: 'error',
        })
      );
    }
  }

  modifyInstitution(){
    this.store.dispatch(
      new ModifyUserInstitutionAction({
        userId: this.profileData.id,
        institutionId: this.moderationForm.controls['institution'].value?.id,
        designation: this.moderationForm.controls['designation'].value//.get('role').value,
      })
    );

    this.closeDialog();
  }
  
  approvalConfirmation() {
    const roleValue = this.moderationForm.get('role').value;
    if (roleValue) {
      const roleOption = this.roleOptions.find((r) => r.value == roleValue);
      const roleName = roleOption.label;
      const dialogRef = this.dialog.open(UserApprovalConfirmationDialog, {
        data: { ...this.profileData, role: { id: roleValue, name: roleName } },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result == true) {
          this.approveUser();
        }
      });
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message: 'Please select role before attempting to approve.',
          action: 'error',
        })
      );
    }
  }
  approveUser() {
    this.store.dispatch(
      new ApproveMemberAction({
        userId: this.profileData.id,
        roleName: this.moderationForm.get('role').value,
      })
    );

    this.closeDialog();
  }

  denialConfirmation() {
    if (this.moderationForm.get('remarks').value) {
      const dialogRef = this.dialog.open(UserDenialConfirmationDialog, {
        data: this.profileData,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result == true) {
          this.denyUser();
        }
      });
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message: 'Please add a remark before attempting to deny.',
          action: 'error',
        })
      );
    }
  }
  denyUser() {
    this.store.dispatch(
      new SuspendMemberAction({
        userId: this.profileData.id,
        remarks: this.moderationForm.get('remarks').value,
      })
    );
    this.closeDialog();
  }

  
  displayFn(user) {
    return user?.name;
  }

  filterInstitution(event){
    if (event) {
      this.moderationForm.controls['designation'].setValue('');
      this.institutionOptions = [];
      this.designationOptions = [];
      this.filteredInstitutionOptions$ = of([]).pipe(map((item) => item));
      this.filterValue = event.target.value.toLowerCase();
      if (this.filterValue.length >= 3) {
        this.store.dispatch(new searchInstitution({ name: this.filterValue }));
      }
    }
  }

  selectInstitution(e) {
    let institution = e;
    if (institution) {
      this.designationOptions = [];
      this.store.dispatch(new FetchDesignationByInstitution({ id: institution?.id }));
      // if (institution?.name != this.currentMember?.institution?.name) {
      //   this.memberForm.controls['institution'].get('designation').setValue('');
      // } else if (institution?.name == this.currentMember?.institution?.name) {
      //   this.memberForm.controls['institution'].get('designation').setValue(this.currentMember.designation);
      // }
    }
  }
}

@Component({
  selector: 'user-approval-confirmation-dialog',
  templateUrl: 'approval-confirmation-dialog.html',
})
export class UserApprovalConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<UserApprovalConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}
}

@Component({
  selector: 'user-denial-confirmation-dialog',
  templateUrl: 'denial-confirmation-dialog.html',
})
export class UserDenialConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<UserApprovalConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}
}

@Component({
  selector:'user-institution-modification-confirmation-dialog',
  templateUrl:'institution-change-dialog.html',
})
export class UserInstitutionChangeConfirmationDialog {
  userData:any 
  constructor(
    public dialogRef: MatDialogRef<UserInstitutionChangeConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data:any
  ) {
    this.userData = JSON.parse(data)

// this.userData=JSON.parse(this.data);
  }
}
