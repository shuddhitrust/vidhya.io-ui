import { Component, Inject, OnInit } from '@angular/core';
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
  CreateUpdateGroupAction,
  GetGroupAction,
} from 'src/app/shared/state/groups/group.actions';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import { Observable } from 'rxjs';
import {
  emptyGroupFormRecord,
  groupTypeOptions,
} from 'src/app/shared/state/groups/group.model';
import { InstitutionState } from 'src/app/shared/state/institutions/institution.state';
import { Group, MatSelectOption } from 'src/app/shared/common/models';
import { FetchInstitutionsAction } from 'src/app/shared/state/institutions/institution.actions';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { environment } from 'src/environments/environment';
import { UploadService } from 'src/app/shared/api/upload.service';
import { FetchMemberOptionsByInstitution } from 'src/app/shared/state/options/options.actions';
import { AuthState } from 'src/app/shared/state/auth/auth.state';

@Component({
  selector: 'app-add-edit-group',
  templateUrl: './add-edit-group.component.html',
  styleUrls: [
    './add-edit-group.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditGroupComponent implements OnInit {
  selectedMemberColumns = [{ field: 'label', headerName: 'Group Members' }];
  memberRows: MatSelectOption[] = [];
  formSubmitting: boolean = false;
  params: object = {};
  @Select(GroupState.getGroupFormRecord)
  groupFormRecord$: Observable<Group>;
  @Select(GroupState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  groupFormRecord: Group = emptyGroupFormRecord;
  groupForm: FormGroup;
  logoFile = null;
  previewPath = null;

  @Select(InstitutionState.listInstitutionOptions)
  institutionOptions$: Observable<MatSelectOption[]>;
  @Select(OptionsState.listMembersByInstitution)
  memberOptions$: Observable<MatSelectOption[]>;
  memberOptions: MatSelectOption[];
  @Select(OptionsState.getIsFetchingMembersByInstitution)
  isFetchingMembers$: Observable<boolean>;
  isFetchingMembers: boolean;
  groupTypeOptions: MatSelectOption[] = groupTypeOptions;
  institutionOptions;
  @Select(AuthState.getCurrentMemberInstitutionId)
  memberInstitutionId$: Observable<string>;
  memberInstitutionId: string;

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private uploadService: UploadService
  ) {
    this.memberInstitutionId$.subscribe((val) => {
      this.memberInstitutionId = val;
    });
    this.institutionOptions$.subscribe((options) => {
      this.institutionOptions = options;
    });
    this.memberOptions$.subscribe((options) => {
      this.memberOptions = options;
    });

    this.isFetchingMembers$.subscribe((val) => {
      this.isFetchingMembers = val;
    });
    this.store.dispatch(
      new FetchMemberOptionsByInstitution({
        memberInstitutionId: this.memberInstitutionId,
      })
    );
    this.store.dispatch(
      new FetchInstitutionsAction({ searchParams: defaultSearchParams })
    );
    this.groupForm = this.setupGroupFormGroup();
    this.groupFormRecord$.subscribe((val) => {
      this.groupFormRecord = val;
      this.groupForm = this.setupGroupFormGroup(this.groupFormRecord);
    });
  }

  setupGroupFormGroup = (
    groupFormRecord: Group = emptyGroupFormRecord
  ): FormGroup => {
    this.logoFile = null;
    this.previewPath = null;
    const memberIds = groupFormRecord?.members.map((m) => m.id);
    const adminIds = groupFormRecord?.admins.map((m) => m.id);
    const formGroup = this.fb.group({
      id: [groupFormRecord?.id],
      avatar: [groupFormRecord?.avatar],
      name: [groupFormRecord?.name, Validators.required],
      institution: [groupFormRecord?.institution?.id, Validators.required],
      admins: [adminIds],
      members: [memberIds],
      groupType: [groupFormRecord?.groupType, Validators.required],
      description: [groupFormRecord?.description, Validators.required],
    });
    this.memberRows = this.memberOptions.filter((o) =>
      memberIds.includes(o.value)
    );
    this.previewPath = formGroup.get('avatar').value;
    return formGroup;
  };

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
      this.previewPath = this.groupForm.get('avatar').value;
    }
  }

  imagePreview(e) {
    const file = (e.target as HTMLInputElement).files[0];
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetGroupAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
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
          form.get('avatar').setValue(url);
          this.store.dispatch(
            new CreateUpdateGroupAction({ form, formDirective })
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
        new CreateUpdateGroupAction({
          form,
          formDirective,
        })
      );
    }
  }
}

@Component({
  selector: 'group-member-review-dialog',
  styleUrls: ['./add-edit-group.component.scss'],
  templateUrl: './group-member-review-dialog.html',
})
export class GroupMemberReviewDialog {
  membersToAddColumns = [{ field: 'label', headerName: 'Members to Add' }];
  membersToRemoveColumns = [
    { field: 'label', headerName: 'Members to Remove' },
  ];
  membersToAdd = [];
  membersToRemove = [];
  constructor(
    public dialogRef: MatDialogRef<GroupMemberReviewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const { columns, membersToAdd, membersToRemove } = this.data;
    this.membersToAdd = membersToAdd;
    this.membersToRemove = membersToRemove;
  }
}
