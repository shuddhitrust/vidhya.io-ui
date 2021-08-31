import { Component, Inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DragDropInput {
  id: number;
  label: string;
}

@Component({
  selector: 'app-drag-drop-component',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.scss'],
})
export class DragDropComponent {
  dataIndices = [];
  items = [];
  constructor(
    public dialogRef: MatDialogRef<DragDropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DragDropInput[]
  ) {
    this.dialogRef.disableClose = true; //disable default close operation
    this.dialogRef.backdropClick().subscribe((result) => {
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
}
