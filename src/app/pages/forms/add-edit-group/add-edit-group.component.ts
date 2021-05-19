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
  CreateUpdateGroup,
  GetGroup,
} from 'src/app/shared/state/groups/group.actions';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import { Observable } from 'rxjs';
import {
  emptyGroupFormRecord,
  groupTypeOptions,
} from 'src/app/shared/state/groups/group.model';
import { InstitutionState } from 'src/app/shared/state/institutions/institution.state';
import { Group, MatSelectOption } from 'src/app/shared/common/models';
import { FetchInstitutions } from 'src/app/shared/state/institutions/institution.actions';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { FetchMemberOptionsByInstitution } from 'src/app/shared/state/members/member.actions';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

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

    this.store.dispatch(new FetchInstitutions({}));
    this.groupForm = this.setupGroupFormGroup();
    this.groupFormRecord$.subscribe((val) => {
      console.log('The group form record');
      this.groupFormRecord = val;
      this.store.dispatch(
        new FetchMemberOptionsByInstitution({
          memberInstitutionId: this.groupFormRecord?.institution?.id,
        })
      );
      this.groupForm = this.setupGroupFormGroup(this.groupFormRecord);
      this.groupForm.valueChanges.subscribe((vals) => {
        console.log('values of groupForm changed ', { vals });
        if (this.memberInstitutionId != vals?.groupInstitutionId) {
          console.log('fetching members by institutionId');
          this.memberInstitutionId = vals?.groupInstitutionId;
          this.store.dispatch(
            new FetchMemberOptionsByInstitution({
              memberInstitutionId: this.memberInstitutionId,
            })
          );
        }
        this.memberRows = vals.members?.map((id) => {
          return this.memberOptions.find((option) => option.value == id);
        });
        console.log('new member rows ', {
          memberOptions: this.memberOptions,
          memberRows: this.memberRows,
        });
      });
    });
  }

  setupGroupFormGroup = (
    groupFormRecord: Group = emptyGroupFormRecord
  ): FormGroup => {
    return this.fb.group({
      id: [groupFormRecord?.id],
      name: [groupFormRecord?.name, Validators.required],
      groupInstitutionId: [
        groupFormRecord?.institution?.id,
        Validators.required,
      ],
      type: [groupFormRecord?.type, Validators.required],
      description: [groupFormRecord?.description, Validators.required],
      // admins: [groupFormRecord.admins],
      members: [groupFormRecord?.members?.items?.map((m) => m.id)],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetGroup({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  calculateMemberChanges(form) {
    let membersToAdd = [];
    let membersToRemove = [];
    const originalMemberList = this.groupFormRecord.members?.items
      ? this.groupFormRecord.members?.items
      : [];
    const newMemberList = form.value.members ? form.value.members : [];
    console.log(
      'originalMemberList, newMemberList',
      originalMemberList,
      newMemberList
    );

    const originalIds = originalMemberList.map((m) => m.id);
    const newIds = newMemberList;

    let add = newMemberList.filter((m) => !originalIds.includes(m));
    let remove = originalIds.filter((o) => !newIds.includes(o));
    membersToAdd = add.map((id) =>
      this.memberOptions.find((o) => o.value == id)
    );
    membersToRemove = remove.map((id) =>
      this.memberOptions.find((o) => o.value == id)
    );
    console.log('After calculating member changes', {
      membersToAdd,
      membersToRemove,
    });

    return { membersToAdd, membersToRemove };
  }

  reviewMemberInfo(form: FormGroup, formDirective: FormGroupDirective) {
    const { membersToAdd, membersToRemove } = this.calculateMemberChanges(form);
    const addMemberIds = membersToAdd.map((m) => m.value);
    const removeMemberIds = membersToRemove.map((m) => m.value);

    if (membersToAdd.length || membersToRemove.length) {
      const dialogRef = this.dialog.open(GroupMemberReviewDialog, {
        data: {
          membersToAdd,
          membersToRemove,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result == true) {
          this.submitForm(form, formDirective, addMemberIds, removeMemberIds);
        }
      });
    } else {
      this.submitForm(form, formDirective, addMemberIds, removeMemberIds);
    }
  }
  submitForm(
    form: FormGroup,
    formDirective: FormGroupDirective,
    addMemberIds,
    removeMemberIds
  ) {
    this.store.dispatch(
      new CreateUpdateGroup({
        form,
        formDirective,
        addMemberIds,
        removeMemberIds,
      })
    );
  }
}

@Component({
  selector: 'group-member-review-dialog',
  styleUrls: [
    './add-edit-group.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
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
