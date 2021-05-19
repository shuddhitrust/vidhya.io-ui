import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ICellRendererParams } from 'ag-grid-community';
import { MemberProfileComponent } from 'src/app/pages/modals/member-profile/member-profile.component';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile-renderer.component.html',
  styleUrls: ['./member-profile-renderer.component.scss'],
})
export class MemberProfileRendererComponent {
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
    this.params.context.componentParent.openMemberProfile(this.rowData);
  }
  openDialog() {
    const dialogRef = this.dialog.open(MemberProfileComponent, {
      data: this.rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
