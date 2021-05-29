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
  memberRows = [];
  formSubmitting: boolean = false;
  params: object = {};
  @Select(GroupState.getGroupFormRecord)
  groupFormRecord$: Observable<Group>;
  @Select(GroupState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  groupFormRecord: Group = emptyGroupFormRecord;
  groupForm: FormGroup;

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
  memberInstitutionId: string;

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
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
      new FetchInstitutionsAction({ searchParams: defaultSearchParams })
    );
    this.groupForm = this.setupGroupFormGroup();
    this.groupFormRecord$.subscribe((val) => {
      this.groupFormRecord = val;
      this.groupForm = this.setupGroupFormGroup(this.groupFormRecord);
    });
    console.log('Group type options ', { groupTypeOptions });
  }

  setupGroupFormGroup = (
    groupFormRecord: Group = emptyGroupFormRecord
  ): FormGroup => {
    return this.fb.group({
      id: [groupFormRecord?.id],
      name: [groupFormRecord?.name, Validators.required],
      institution: [groupFormRecord?.institution?.id, Validators.required],
      groupType: [groupFormRecord?.groupType, Validators.required],
      description: [groupFormRecord?.description, Validators.required],
    });
  };
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
    this.store.dispatch(
      new CreateUpdateGroupAction({
        form,
        formDirective,
      })
    );
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
