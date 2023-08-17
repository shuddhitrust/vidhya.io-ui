import { Component, Inject, OnDestroy } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  CriterionResponse,
  ExerciseRubric,
  SubmissionRubric,
} from '../../common/models';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from '../confirmation-dialog/confirmation-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-rubric-display-dialog',
  templateUrl: './rubric-display-dialog.component.html',
  styleUrls: [
    './rubric-display-dialog.component.scss',
    './../../common/shared-styles.css',
  ],
})
export class ExerciseRubricDialog implements OnDestroy{
  rubric: any = [];
  rubricDatatableColumns: string[] = ['description', 'points', 'remarks'];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialogRef: MatDialogRef<ExerciseRubricDialog>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.sanitizeRubric();
  }

  sanitizeRubric() {
    this.rubric = this.data.rubric.map((c) => {
      let newC = Object.assign({}, c);
      newC.description = c.criterion?.description
        ? c.criterion?.description
        : c.description;
      newC.score = c.score ? c.score : 0;
      newC.points = c.criterion?.points ? c.criterion?.points : c.points;
      return newC;
    });
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

    dialogRef.afterClosed()   
    .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
