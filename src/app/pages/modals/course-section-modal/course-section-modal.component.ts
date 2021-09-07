import { Component, Inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import {
  Course,
  CourseSection,
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { emptyCourseFormRecord } from 'src/app/shared/state/courses/course.model';
import {
  CreateUpdateCourseSectionAction,
  DeleteCourseSectionAction,
} from 'src/app/shared/state/courseSections/courseSection.actions';
import { emptyCourseSectionFormRecord } from 'src/app/shared/state/courseSections/courseSection.model';
import { CourseSectionState } from 'src/app/shared/state/courseSections/courseSection.state';
import { DeleteMemberAction } from 'src/app/shared/state/members/member.actions';
import { UserModerationProfileComponent } from '../moderate-user/user-moderation.component';

@Component({
  selector: 'course-section-modal',
  templateUrl: './course-section-modal.component.html',
  styleUrls: [
    './course-section-modal.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class CourseSectionModalComponent {
  resource = resources.COURSE;
  resourceActions = RESOURCE_ACTIONS;
  @Input()
  course: Course;
  @Input()
  courseSection: CourseSection = emptyCourseSectionFormRecord;
  @Select(CourseSectionState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  sectionForm: FormGroup;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CourseSectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private auth: AuthorizationService,
    private fb: FormBuilder
  ) {
    this.course = this.data.course;
    this.courseSection = this.data.courseSection;
    this.sectionForm = this.setupCourseSectionForm(this.courseSection);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  setupCourseSectionForm = (
    courseSectionForm: CourseSection = emptyCourseSectionFormRecord
  ): FormGroup => {
    return this.fb.group({
      id: [courseSectionForm?.id],
      title: [courseSectionForm?.title, Validators.required],
      index: [courseSectionForm?.index],
      course: [this.course.id],
    });
  };

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: [this.course?.instructor?.id],
    });
  }

  // editMember() {
  //   this.closeDialog();
  //   const id = this.profileData.id;
  //   this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route], {
  //     relativeTo: this.route,
  //     queryParams: { id },
  //     queryParamsHandling: 'merge',
  //     skipLocationChange: false,
  //   });
  // }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    this.sectionForm.get('course').setValue(this.course.id);
    this.store.dispatch(
      new CreateUpdateCourseSectionAction({
        form,
        formDirective,
      })
    );
  }

  deleteConfirmation() {
    const dialogRef = this.dialog.open(CouseSectionDeleteConfirmationDialog, {
      data: this.courseSection,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteCourseSection();
      }
    });
  }
  deleteCourseSection() {
    this.store.dispatch(
      new DeleteCourseSectionAction({ id: this.courseSection.id })
    );
    this.closeDialog();
  }
}

@Component({
  selector: 'member-delete-confirmation-dialog',
  templateUrl: 'delete-confirmation-dialog.html',
})
export class CouseSectionDeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<CouseSectionDeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CourseSection
  ) {}
}
