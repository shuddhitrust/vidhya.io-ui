import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormGroupDirective,
} from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';

import {
  CreateUpdateAnnouncementAction,
  GetAnnouncementAction,
} from 'src/app/shared/state/announcements/announcement.actions';
import { AnnouncementState } from 'src/app/shared/state/announcements/announcement.state';
import { Observable } from 'rxjs';
import { emptyAnnouncementFormRecord } from 'src/app/shared/state/announcements/announcement.model';
import { Announcement, MatSelectOption } from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { GroupState } from 'src/app/shared/state/groups/group.state';
@Component({
  selector: 'app-add-edit-announcement',
  templateUrl: './add-edit-announcement.component.html',
  styleUrls: [
    './add-edit-announcement.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditAnnouncementComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {};
  @Select(AnnouncementState.getAnnouncementFormRecord)
  announcementFormRecord$: Observable<Announcement>;
  @Select(GroupState.listGroupOptions)
  groupOptions$: Observable<MatSelectOption[]>;
  @Select(AnnouncementState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(AuthState.getCurrentMemberInstitutionId)
  currentMemberInstitutionId$: Observable<number>;
  currentMemberInstitutionId: number = 1;
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number = 4;
  announcementFormRecord: Announcement = emptyAnnouncementFormRecord;
  announcementForm: FormGroup;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.announcementForm = this.setupAnnouncementFormGroup();
    this.announcementFormRecord$.subscribe((val) => {
      this.announcementFormRecord = val;
      this.announcementForm = this.setupAnnouncementFormGroup(
        this.announcementFormRecord
      );
    });

    this.currentUserId$.subscribe((val) => {
      this.currentUserId = val;
    });
  }

  setupAnnouncementFormGroup = (
    announcementFormRecord: Announcement = emptyAnnouncementFormRecord
  ): FormGroup => {
    console.log('the current User id ', this.currentUserId);
    return this.fb.group({
      id: [announcementFormRecord?.id],
      author: [
        announcementFormRecord?.author?.id
          ? announcementFormRecord?.author?.id
          : this.currentUserId,
        Validators.required,
      ],
      title: [announcementFormRecord?.title, Validators.required],
      institution: [
        announcementFormRecord.institution?.id
          ? announcementFormRecord.institution?.id
          : this.currentMemberInstitutionId,
        Validators.required,
      ],
      message: [announcementFormRecord?.message, Validators.required],
      groups: [announcementFormRecord?.groups, Validators.required],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetAnnouncementAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    console.log('announcement submit form value => ', form.value);
    this.store.dispatch(
      new CreateUpdateAnnouncementAction({
        form,
        formDirective,
      })
    );
  }
}
