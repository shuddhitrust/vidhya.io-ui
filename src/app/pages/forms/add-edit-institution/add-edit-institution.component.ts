import { Component, OnInit } from '@angular/core';
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
  CreateUpdateInstitutionAction,
  GetInstitutionAction,
} from 'src/app/shared/state/institutions/institution.actions';
import { InstitutionState } from 'src/app/shared/state/institutions/institution.state';
import { Observable } from 'rxjs';
import { emptyInstitutionFormRecord } from 'src/app/shared/state/institutions/institution.model';
import { Institution } from 'src/app/shared/common/models';

@Component({
  selector: 'app-add-edit-institution',
  templateUrl: './add-edit-institution.component.html',
  styleUrls: [
    './add-edit-institution.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditInstitutionComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {};
  @Select(InstitutionState.getInstitutionFormRecord)
  institutionFormRecord$: Observable<Institution>;
  @Select(InstitutionState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  institutionFormRecord: Institution = emptyInstitutionFormRecord;
  institutionForm: FormGroup;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.institutionForm = this.setupInstitutionFormGroup();
    this.institutionFormRecord$.subscribe((val) => {
      this.institutionFormRecord = val;
      this.institutionForm = this.setupInstitutionFormGroup(
        this.institutionFormRecord
      );
    });
  }

  setupInstitutionFormGroup = (
    institutionFormRecord: Institution = emptyInstitutionFormRecord
  ): FormGroup => {
    return this.fb.group({
      id: [institutionFormRecord.id],
      name: [institutionFormRecord.name, Validators.required],
      location: [institutionFormRecord.location, Validators.required],
      city: [institutionFormRecord.city, Validators.required],
      website: [institutionFormRecord.website],
      phone: [institutionFormRecord.phone],
      logo: [institutionFormRecord.logo],
      bio: [institutionFormRecord.bio],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetInstitutionAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    console.log('Institution Form ', { form });
    this.store.dispatch(
      new CreateUpdateInstitutionAction({ form, formDirective })
    );
  }
}
