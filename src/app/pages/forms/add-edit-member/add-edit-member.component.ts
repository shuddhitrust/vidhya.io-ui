import { Component, OnInit } from '@angular/core';
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
  CreateUpdateMember,
  GetMember,
} from 'src/app/shared/state/members/member.actions';
import { MemberState } from 'src/app/shared/state/members/member.state';
import { Observable } from 'rxjs';
import {
  emptyMemberFormRecord,
  userTypeOptions,
  membershipStatusOptions,
} from 'src/app/shared/state/members/member.model';
import { InstitutionState } from 'src/app/shared/state/institutions/institution.state';
import { FetchInstitutionsAction } from 'src/app/shared/state/institutions/institution.actions';
import {
  MatSelectOption,
  MembershipStatus,
  User,
} from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { AuthStateModel } from 'src/app/shared/state/auth/auth.model';
import { MemberDeleteConfirmationDialog } from '../../modals/member-profile/member-profile.component';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { OptionsStateModel } from 'src/app/shared/state/options/options.model';
import { FetchGroupOptionsByInstitution } from 'src/app/shared/state/options/options.actions';

@Component({
  selector: 'app-add-edit-member',
  templateUrl: './add-edit-member.component.html',
  styleUrls: [
    './add-edit-member.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditMemberComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {}; // URL Params
  @Select(InstitutionState.listInstitutionOptions)
  institutionOptions$: Observable<MatSelectOption[]>;
  institutionOptions: MatSelectOption[];
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
  membershipStatus: MembershipStatus;
  createForm: boolean;
  memberForm: FormGroup;
  isFetchingGroups: boolean;
  @Select(OptionsState.listClassesByInstitution)
  groupOptions$: Observable<MatSelectOption[]>;
  groupOptions: MatSelectOption[];
  @Select(OptionsState)
  optionsState$: Observable<OptionsStateModel>;
  optionsState: OptionsStateModel;
  groupInstitutionId: string;

  // Static Options List
  userTypeOptions: MatSelectOption[] = userTypeOptions;
  membershipStatusOptions: MatSelectOption[] = membershipStatusOptions;

  // Validation Constants
  titleMaxLength = 60;
  bioMaxLength = 150;
  updateForm: boolean = false;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.institutionOptions$.subscribe((options) => {
      this.institutionOptions = options;
    });
    this.isFetchingInstitutions$.subscribe((val) => {
      this.isFetchingInstitutions = val;
    });
    this.optionsState$.subscribe((val: OptionsStateModel) => {
      this.optionsState = val;
      this.isFetchingGroups = val.isFetchingGroupsByInstitution;
      this.groupInstitutionId = val.groupInstitutionId;
    });
    this.groupOptions$.subscribe((val) => {
      this.groupOptions = val;
    });
    this.authState$.subscribe((val) => {
      console.log('is fully authenticated from member form ', val);
      this.authState = val;
      this.isFullyAuthenticated = this.authState.isFullyAuthenticated;
      // this.membershipStatus = this.authState.membershipStatus;
      // this.createForm =
      //   this.membershipStatus == MembershipStatus.PENDING_REGISTRATION; // The form is set to createForm when user status is pending_registration
      console.log('current pending registration => ', {
        membershipStatus: this.membershipStatus,
        createForm: this.createForm,
        authState: this.authState,
      });
    });
    this.checkIfFormContainsRecord();
    this.store.dispatch(new FetchInstitutionsAction({}));
    this.memberForm = this.setupMemberFormGroup();
    // this.memberFormRecord$.subscribe((val) => {
    //   this.memberFormRecord = val;
    //   this.memberForm = this.setupMemberFormGroup(this.memberFormRecord);
    //   this.memberForm.valueChanges.subscribe((vals) => {
    //     if (vals.memberInstitutionId != this.groupInstitutionId) {
    //       this.store.dispatch(
    //         new FetchGroupOptionsByInstitution({
    //           groupInstitutionId: vals?.memberInstitutionId,
    //           filter: { type: { eq: GroupType.CLASS } },
    //         })
    //       );
    //     }
    //   });
    //   console.log('this.memberForm', {
    //     memberFormRecord: this.memberFormRecord,
    //     form: this.memberForm,
    //   });
    //   this.checkIfFormContainsRecord();
    //   console.log('enableSubmitButton ', {
    //     updateForm: this.updateForm,
    //   });
    //   // if (!this.updateForm) {
    //   //   this.goHome();
    //   // }
    // });
  }
  checkIfFormContainsRecord() {
    this.updateForm = this.memberFormRecord.id != null;
  }
  setupMemberFormGroup = (
    memberFormRecord: User = emptyMemberFormRecord
  ): FormGroup => {
    return this.fb.group({
      id: [memberFormRecord?.id],
      name: [memberFormRecord?.name, Validators.required],
      // email: [memberFormRecord.email, [Validators.required, Validators.email]],
      type: [memberFormRecord?.type, Validators.required],
      membershipStatus: [
        memberFormRecord?.membershipStatus,
        Validators.required,
      ],
      memberInstitutionId: [
        memberFormRecord?.institution?.id,
        Validators.required,
      ],
      groups: [null],
      title: [
        memberFormRecord?.title,
        Validators.maxLength(this.titleMaxLength),
      ],
      bio: [memberFormRecord?.bio, Validators.maxLength(this.bioMaxLength)],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetMember({ id }));
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(
      new CreateUpdateMember({
        form,
        formDirective,
        institutionOptions: this.institutionOptions,
      })
    );
  }
}
