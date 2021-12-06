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
import { Observable } from 'rxjs';
import { Course, MatSelectOption } from 'src/app/shared/common/models';
import { InstitutionState } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.state';
import { FetchInstitutionsAction } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { FetchMemberOptionsByInstitution } from 'src/app/shared/state/options/options.actions';
import { DefaultColDef } from 'src/app/shared/modules/master-grid/table.config';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { CourseState } from '../../../state/courses/course.state';
import { emptyCourseFormRecord } from '../../../state/courses/course.model';
import {
  CreateUpdateCourseAction,
  FetchCoursesAction,
  GetCourseAction,
} from '../../../state/courses/course.actions';

@Component({
  selector: 'app-add-edit-course',
  templateUrl: './add-edit-course.component.html',
  styleUrls: [
    './add-edit-course.component.scss',
    './../../../../../../../shared/common/shared-styles.css',
  ],
})
export class AddEditCourseComponent implements OnInit {
  gridApi;
  gridColumnApi;
  memberColumns = [{ field: 'label', headerName: 'Members' }];
  defaultColDef: any = DefaultColDef;
  memberRows: MatSelectOption[] = [];
  participantRows = [];
  formSubmitting: boolean = false;
  params: object = {};
  currentDate = new Date();
  @Select(CourseState.getCourseFormRecord)
  courseFormRecord$: Observable<Course>;
  @Select(CourseState.isFetching)
  isFetchingCourse$: Observable<boolean>;
  @Select(InstitutionState.listInstitutionOptions)
  institutionOptions$: Observable<MatSelectOption[]>;
  @Select(CourseState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(CourseState.listCourseOptions)
  courseOptions$: Observable<MatSelectOption[]>;
  courseOptions: MatSelectOption[];
  @Select(AuthState.getCurrentMemberInstitutionId)
  currentMemberInstitutionId$: Observable<number>;
  currentMemberInstitutionId: number = 1;
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number;
  @Select(OptionsState.listMembersByInstitution)
  memberOptions$: Observable<MatSelectOption[]>;
  memberOptions: MatSelectOption[];
  @Select(OptionsState.getIsFetchingMembersByInstitution)
  isFetchingMembers$: Observable<boolean>;
  isFetchingMembers: boolean;
  courseFormRecord: Course = emptyCourseFormRecord;
  courseForm: FormGroup;
  @Select(AuthState.getCurrentMemberInstitutionId)
  memberInstitutionId$: Observable<number>;
  memberInstitutionId: number;
  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.memberInstitutionId$.subscribe((val) => {
      this.memberInstitutionId = val;
      this.store.dispatch(
        new FetchMemberOptionsByInstitution({
          memberInstitutionId: this.memberInstitutionId,
        })
      );
    });
    this.memberOptions$.subscribe((options) => {
      this.memberOptions = options;
      this.memberRows = this.memberOptions;
    });
    this.store.dispatch(
      new FetchMemberOptionsByInstitution({
        memberInstitutionId: this.memberInstitutionId,
      })
    );
    this.store.dispatch(
      new FetchInstitutionsAction({ searchParams: defaultSearchParams })
    );
    this.store.dispatch(
      new FetchCoursesAction({ searchParams: defaultSearchParams })
    );
    this.currentUserId$.subscribe((val) => {
      this.currentUserId = val;
    });
    this.setupCourseFormGroup();
    this.courseOptions$.subscribe((val) => {
      this.courseOptions = val;
    });

    this.courseFormRecord$.subscribe((val) => {
      this.courseFormRecord = val;
      this.setupCourseFormGroup(this.courseFormRecord);
      // Filtering out the current coursee from the options
      this.courseOptions = this.courseOptions.filter((o) => {
        return o.value !== this.courseFormRecord?.id;
      });
    });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.updateSelectedRowsInParticipantTable();
    // this.autoSizeAllColumns();
  }

  onSelectionChanged = (event$) => {
    const participantRows = this.gridApi.getSelectedRows();
    const participantIds = participantRows.map((row) => row.value);
    this.courseForm.get('participants').setValue(participantIds);
  };

  setupCourseFormGroup = (courseFormRecord: Course = emptyCourseFormRecord) => {
    const participantIds = courseFormRecord?.participants?.map((p) => p.id);
    const formGroup = this.fb.group({
      id: [courseFormRecord?.id],
      instructor: [
        courseFormRecord?.instructor?.id
          ? courseFormRecord?.instructor?.id
          : this.currentUserId,
        Validators.required,
      ],
      title: [courseFormRecord?.title, Validators.required],
      blurb: [courseFormRecord?.blurb, Validators.required],
      description: [courseFormRecord?.description, Validators.required],
      institutions: [
        courseFormRecord.institutions?.map((i) => i.id)
          ? courseFormRecord.institutions?.map((i) => i.id)
          : [],
      ],
      mandatoryPrerequisites: [
        courseFormRecord.mandatoryPrerequisites?.map((i) => i.id)
          ? courseFormRecord.mandatoryPrerequisites?.map((i) => i.id)
          : [],
      ],
      recommendedPrerequisites: [
        courseFormRecord.recommendedPrerequisites?.map((i) => i.id)
          ? courseFormRecord.recommendedPrerequisites?.map((i) => i.id)
          : [],
      ],
      startDate: [courseFormRecord?.startDate],
      endDate: [courseFormRecord?.endDate],
      passScorePercentage: [courseFormRecord?.passScorePercentage],
      passCompletionPercentage: [courseFormRecord?.passCompletionPercentage],
      creditHours: [courseFormRecord?.creditHours],
      participants: [participantIds],
    });
    this.participantRows = this.memberOptions.filter((m) =>
      participantIds.includes(m.value)
    );
    this.courseForm = formGroup;
    this.updateSelectedRowsInParticipantTable();
  };

  updateSelectedRowsInParticipantTable() {
    const participantIds = this.courseForm?.get('participants').value
      ? this.courseForm?.get('participants').value
      : [];
    this.gridApi?.forEachNodeAfterFilter((node) => {
      // select the node
      if (participantIds.includes(node.data.value)) {
        node.setSelected(true);
      }
    });
  }

  participantCount() {
    return this.courseForm.get('participants').value?.length;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(
          new GetCourseAction({ id, fetchFormDetails: true })
        );
      }
    });
  }

  goBack() {
    this.location.back();
  }

  updateParticipantRows($event) {
    const participantIds = this.courseForm
      .get('participants')
      .value.map((id) => id);
    this.participantRows = this.memberOptions.filter((o) => {
      return participantIds.includes(o.value);
    });
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(
      new CreateUpdateCourseAction({
        form,
        formDirective,
      })
    );
  }
}
