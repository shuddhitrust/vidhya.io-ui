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
  CreateUpdateMemberAction,
  GetMemberAction,
} from 'src/app/shared/state/members/member.actions';
import { MemberState } from 'src/app/shared/state/members/member.state';
import { Observable } from 'rxjs';
import {
  emptyMemberFormRecord,
  membershipStatusOptions,
} from 'src/app/shared/state/members/member.model';
import { InstitutionState } from 'src/app/shared/state/institutions/institution.state';
import { FetchInstitutionsAction } from 'src/app/shared/state/institutions/institution.actions';
import {
  CurrentMember,
  defaultResourcePermissions,
  MatSelectOption,
  User,
} from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { AuthStateModel } from 'src/app/shared/state/auth/auth.model';
import { MemberDeleteConfirmationDialog } from '../../modals/member-profile/member-profile.component';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { OptionsStateModel } from 'src/app/shared/state/options/options.model';
import { FetchGroupOptionsByInstitution } from 'src/app/shared/state/options/options.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { UploadService } from 'src/app/shared/api/upload.service';
import { environment } from 'src/environments/environment';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';

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
  firstTimeSetup: boolean;
  currentMember: User;

  // Validation Constants
  titleMaxLength = 60;
  bioMaxLength = 150;
  updateForm: boolean = false;
  avatarFile = null;
  previewPath = null;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private uploadService: UploadService
  ) {
    console.log('from the member form component!');
    this.authState$.subscribe((val) => {
      console.log('is fully authenticated from member form ', val);
      this.authState = val;
      this.isFullyAuthenticated = this.authState.isFullyAuthenticated;
      this.currentMember = this.authState.currentMember;
      this.firstTimeSetup = this.authState.firstTimeSetup;
      this.currentMember = {
        username: this.currentMember.username,
        firstName: this.currentMember.firstName,
        lastName: this.currentMember.lastName,
        email: this.currentMember.email,
        avatar: this.currentMember.avatar,
        institution: {
          id: this.currentMember?.institution?.id,
          name: this.currentMember?.institution?.name,
        },
        role: {
          name: this.currentMember?.role.name,
          permissions: this.currentMember?.role?.permissions,
        },
      };
      this.memberForm = this.setupMemberFormGroup(this.currentMember);
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
          this.isFetchingGroups = val.isFetchingGroupsByInstitution;
          this.groupInstitutionId = val.groupInstitutionId;
        });
        this.groupOptions$.subscribe((val) => {
          this.groupOptions = val;
        });
      }
    });
    if (!this.memberForm) {
      this.memberForm = this.setupMemberFormGroup();
    }
    console.log('this.memberForm => ', this.memberForm);
    this.checkIfFormContainsRecord();
  }
  checkIfFormContainsRecord() {
    this.updateForm = this.memberFormRecord.id != null;
  }
  setupMemberFormGroup = (
    memberFormRecord: User = emptyMemberFormRecord
  ): FormGroup => {
    this.avatarFile = null;
    this.previewPath = null;
    const formGroup = this.fb.group({
      id: [memberFormRecord?.id],
      firstName: [memberFormRecord?.firstName, [Validators.required]],
      lastName: [memberFormRecord?.lastName, [Validators.required]],
      avatar: [memberFormRecord?.avatar, [Validators.required]],
      email: [memberFormRecord.email, [Validators.required, Validators.email]],
      institution: [memberFormRecord?.institution?.id, Validators.required],
      title: [
        memberFormRecord?.title,
        Validators.maxLength(this.titleMaxLength),
      ],
      bio: [memberFormRecord?.bio, Validators.maxLength(this.bioMaxLength)],
    });
    this.previewPath = formGroup.get('avatar').value;
    console.log('memberForm at the end of setupMemberFormGroup ', formGroup);
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

  populateInstitution() {
    this.memberForm
      .get('institution')
      .setValue(this.currentMember?.institution?.id);
    this.institutionOptions = [
      {
        value: this.currentMember?.institution?.id,
        label: this.currentMember?.institution?.name,
      },
    ];
    console.log(
      'institution options => ',
      this.institutionOptions,
      'this.memberform.value',
      this.memberForm.value
    );
  }

  goHome() {
    this.router.navigate(['/']);
  }

  onAvatarChange(event) {
    if (event.target.files.length > 0) {
      this.avatarFile = event.target.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewPath = reader.result as string;
      };
      reader.readAsDataURL(this.avatarFile);
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
    console.log('this.avatarFile on submit', this.avatarFile);
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
          const url = `${environment.api_endpoint}${res.file}`;
          form.get('avatar').setValue(url);
          console.log('after setting the new url after upload ', {
            formValue: form.value,
          });
          this.store.dispatch(
            new CreateUpdateMemberAction({ form, formDirective })
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
        new CreateUpdateMemberAction({ form, formDirective })
      );
    }
    // this.store.dispatch(
    //   new CreateUpdateMemberAction({
    //     form,
    //     formDirective,
    //   })
    // );
  }
}
