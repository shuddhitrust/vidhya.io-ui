import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ICellRendererParams } from 'ag-grid-community';
import { MemberProfileComponent } from 'src/app/pages/modals/member-profile/member-profile.component';
import { MembershipStatusOptions } from '../../common/models';

@Component({
  selector: 'app-moderation-renderer',
  templateUrl: './user-moderation-renderer.component.html',
  styleUrls: ['./user-moderation-renderer.component.scss'],
})
export class UserModerationRendererComponent {
  cellValue: string;
  rowData: any;
  params: any;

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.rowData = params.data;
    this.cellValue = this.getValueToDisplay(params);
  }

  disableApproval() {
    return (
      this.rowData.membershipStatus == MembershipStatusOptions.UNINITIALIZED
    );
  }

  showProfile() {
    console.log('params', this.rowData);
  }

  getValueToDisplay(params: ICellRendererParams) {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }

  constructor(public dialog: MatDialog) {}

  public invokeParentMethod() {
    this.params.context.componentParent.moderateUser(this.rowData);
  }
}
