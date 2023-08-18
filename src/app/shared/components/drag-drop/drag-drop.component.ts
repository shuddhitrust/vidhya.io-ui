import { Component, Inject, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface DragDropInput {
  id: number;
  label: string;
}

@Component({
  selector: 'app-drag-drop-component',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.scss'],
})
export class DragDropComponent implements OnDestroy{
  dataIndices = [];
  items = [];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialogRef: MatDialogRef<DragDropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DragDropInput[]
  ) {
    this.dialogRef.disableClose = true; //disable default close operation
    this.dialogRef.backdropClick()
    .pipe(takeUntil(this.destroy$))
    .subscribe((result) => {
      this.dialogRef.close(this.dataIndices);
    });
    this.dataIndices = this.data.map((d) => d.id);
  }

  labelFromId(id) {
    return this.data.find((d) => d.id == id)['label'];
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dataIndices, event.previousIndex, event.currentIndex);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
