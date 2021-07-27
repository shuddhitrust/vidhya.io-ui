import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ICellRendererParams } from 'ag-grid-community';
import { RoleProfileComponent } from 'src/app/pages/modals/role-profile/role-profile.component';

@Component({
  selector: 'app-role-profile',
  templateUrl: './role-profile-renderer.component.html',
  styleUrls: ['./role-profile-renderer.component.scss'],
})
export class RoleProfileRendererComponent {
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
    console.log('params', this.rowData);
  }

  getValueToDisplay(params: ICellRendererParams) {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }

  constructor(public dialog: MatDialog) {}

  public invokeParentMethod() {
    this.params.context.componentParent.openRoleProfile(this.rowData);
  }
  openDialog() {
    const dialogRef = this.dialog.open(RoleProfileComponent, {
      data: this.rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
