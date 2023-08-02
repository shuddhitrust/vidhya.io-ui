import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ICellRendererParams } from 'ag-grid-community';
import { AuthorizationService } from '../../../../../../../../../shared/api/authorization/authorization.service';
import {
  resources,
  RESOURCE_ACTIONS,
} from '../../../../../../../../../shared/common/models';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile-renderer.component.html',
  styleUrls: ['./member-profile-renderer.component.scss'],
})
export class MemberProfileRendererComponent {
  cellValue: string;
  rowData: any;
  params: any;
  resource = resources.USER_ROLE;
  resourceActions = RESOURCE_ACTIONS;

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.rowData = params.data;
    this.cellValue = this.getValueToDisplay(params);
  }

  showProfile() {}

  getValueToDisplay(params: ICellRendererParams) {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }

  constructor(public dialog: MatDialog, private auth: AuthorizationService) {}

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {});
  }

  public invokeParentMethod() {
    if (this.authorizeResourceMethod(this.resourceActions.GET)) {
      this.params.context.componentParent.openMemberProfile(this.rowData);
    }
  }
}
