import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ICellRendererParams } from 'ag-grid-community';
import { InstitutionModalComponent } from 'src/app/pages/modals/institution-modal/institution-modal.component';
import { AuthorizationService } from '../../api/authorization/authorization.service';
import { resources, RESOURCE_ACTIONS } from '../../common/models';

@Component({
  selector: 'app-institution-profile',
  templateUrl: './institution-profile-renderer.component.html',
  styleUrls: ['./institution-profile-renderer.component.scss'],
})
export class InstitutionProfileRendererComponent {
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

  showProfile() {
    
  }

  getValueToDisplay(params: ICellRendererParams) {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }

  constructor(public dialog: MatDialog, private auth: AuthorizationService) {}

    authorizeResourceMethod(action) {
    console.log('from authorizeResourceMethod', {action, resource: this.resource, 'result': this.auth.authorizeResource(this.resource, action, {})})
    return this.auth.authorizeResource(this.resource, action, {});
  }


  public invokeParentMethod() {
    if(this.authorizeResourceMethod(this.resourceActions.GET)) {
      this.params.context.componentParent.openInstitutionProfile(this.rowData);
    }    
  }
  openDialog() {
    const dialogRef = this.dialog.open(InstitutionModalComponent, {
      data: this.rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      
    });
  }
}
