import { Component, Inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-drag-drop-component',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.scss'],
})
export class DragDropComponent {
  dataIndices = [];
  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX – The Rise of Skywalker',
  ];
  items = [];
  constructor(
    public dialogRef: MatDialogRef<DragDropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogRef.disableClose = true; //disable default close operation
    this.dialogRef.backdropClick().subscribe((result) => {
      this.dialogRef.close(this.dataIndices);
    });
    this.dataIndices = this.data.map((d) => d.index);
  }

  labelFromIndex(index) {
    return this.data.find((d) => d.index == index)['label'];
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dataIndices, event.previousIndex, event.currentIndex);
  }
}
