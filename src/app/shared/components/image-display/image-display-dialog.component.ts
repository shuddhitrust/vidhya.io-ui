import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'image-display-dialog',
  templateUrl: './image-display-dialog.component.html',
  styleUrls: ['./image-display-dialog.component.scss'],
})
export class ImageDisplayDialog {
  image;
  constructor(
    public dialogRef: MatDialogRef<ImageDisplayDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.image = data.image;
  }
}
