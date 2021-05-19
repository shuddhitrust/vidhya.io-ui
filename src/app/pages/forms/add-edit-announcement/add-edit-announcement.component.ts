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
  CreateUpdateAnnouncement,
  GetAnnouncement,
} from 'src/app/shared/state/announcements/announcement.actions';
import { AnnouncementState } from 'src/app/shared/state/announcements/announcement.state';
import { Observable } from 'rxjs';
import { emptyAnnouncementFormRecord } from 'src/app/shared/state/announcements/announcement.model';
import { Announcement } from 'src/app/shared/common/models';
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
  @Select(AnnouncementState.formSubmitting)
  formSubmitting$: Observable<boolean>;
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
  }

  setupAnnouncementFormGroup = (
    announcementFormRecord: Announcement = emptyAnnouncementFormRecord
  ): FormGroup => {
    return this.fb.group({
      id: [announcementFormRecord.id],
      title: [announcementFormRecord.title, Validators.required],
      // institutionId: [announcementFormRecord.institution, Validators.required],
      message: [announcementFormRecord.message, Validators.required],
      // admins: [announcementFormRecord.admins],
      // members: [announcementFormRecord.members],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetAnnouncement({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(
      new CreateUpdateAnnouncement({
        form,
        formDirective,
      })
    );
  }
}
