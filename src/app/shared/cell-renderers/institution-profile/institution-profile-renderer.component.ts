import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ICellRendererParams } from 'ag-grid-community';
import { InstitutionModalComponent } from 'src/app/pages/modals/institution-modal/institution-modal.component';

@Component({
  selector: 'app-institution-profile',
  templateUrl: './institution-profile-renderer.component.html',
  styleUrls: ['./institution-profile-renderer.component.scss'],
})
export class InstitutionProfileRendererComponent {
  cellValue: string;
  rowData: any;
  params: any;

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.rowData = params.data;
    this.cellValue = this.getValueToDisplay(params);
  }

  showProfile() {
    
  }

  getValueToDisplay(params: ICellRendererParams) {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }

  constructor(public dialog: MatDialog) {}

  public invokeParentMethod() {
    this.params.context.componentParent.openInstitutionProfile(this.rowData);
  }
  openDialog() {
    const dialogRef = this.dialog.open(InstitutionModalComponent, {
      data: this.rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      
    });
  }
}
