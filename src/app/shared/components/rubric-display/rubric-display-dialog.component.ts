import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CriterionResponse, SubmissionRubric } from '../../common/models';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-rubric-display-dialog',
  templateUrl: './rubric-display-dialog.component.html',
  styleUrls: [
    './rubric-display-dialog.component.scss',
    './../../common/shared-styles.css',
  ],
})
export class ExerciseRubricDialog {
  rubric: SubmissionRubric;
  rubricDatatableColumns: string[] = ['description', 'points', 'remarks'];
  constructor(
    public dialogRef: MatDialogRef<ExerciseRubricDialog>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.rubric = data.rubric;
  }

  showRemarks(criterion: CriterionResponse) {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: `Remarks by ${criterion?.remarker?.name}`,
      message: `${criterion.remarks}`,
      confirmButtonText: '',
      denyButtonText: '',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
}
