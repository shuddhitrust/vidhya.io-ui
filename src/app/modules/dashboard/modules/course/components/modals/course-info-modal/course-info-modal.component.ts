import { Component, Inject, Input } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Course } from 'src/app/shared/common/models';

@Component({
  selector: 'course-info-modal',
  templateUrl: './course-info-modal.component.html',
  styleUrls: [
    './course-info-modal.component.scss',
    './../../../../../../../shared/common/shared-styles.css',
  ],
})
export class CourseInfoModalComponent {
  @Input()
  course: Course;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CourseInfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.course = this.data.course;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
