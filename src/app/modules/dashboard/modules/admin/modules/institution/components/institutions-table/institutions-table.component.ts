import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { GridOptions } from 'ag-grid-community';
import { Observable, Subject } from 'rxjs';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { InstitutionProfileRendererComponent } from 'src/app/modules/dashboard/modules/admin/modules/institution/components/institution-profile-cell-renderer/institution-profile-renderer.component';
import {
  Institution,
  FetchParams,
  resources,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  ForceRefetchInstitutionsAction,
  FetchInstitutionsAction,
  ResetInstitutionFormAction,
} from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.actions';
import { InstitutionState } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.state';
import { InstitutionModalComponent } from '../institution-modal/institution-modal.component';
import { ADMIN_SECTION_LABELS } from 'src/app/shared/common/constants';
import moment from 'moment';
import { MemberProfileRendererComponent } from 'src/app/modules/dashboard/modules/admin/modules/member/components/cell-renderers/member-profile/member-profile-renderer.component';
import { MemberProfileComponent } from '../../../member/components/member-profile/member-profile.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-institutions-table',
  templateUrl: './institutions-table.component.html',
  styleUrls: ['./institutions-table.component.scss'],
})
export class InstitutionsTableComponent implements OnInit, OnDestroy {
  tableTitle: string = ADMIN_SECTION_LABELS.INSTITUTIONS;
  resource: string = resources.INSTITUTION;
  institutions: object[];
  @Select(InstitutionState.listInstitutions)
  rows$: Observable<Institution[]>;
  @Select(InstitutionState.isFetching)
  isFetching$: Observable<boolean>;
  @Select(InstitutionState.fetchParams)
  fetchParams$: Observable<FetchParams>;
  columns = [
    {
      field: 'name',
      cellRenderer: 'institutionRenderer',
    },
    { field: 'location' },
    { field: 'city' },
    { field: 'bio' },
    {
      field: 'author',
      cellRenderer:'memberprofileRenderer',
      valueFormatter: (params) => {
        return params?.data?.author?.name;
      },
    },
    {      
      field: 'createdAt',
      headerName:'Creation Date',
      cellRenderer:(params)=>{
        return moment(params.value).format('DD-MM-YYYY HH:mm:ss');
      }
    },
    {field: 'verified',
    cellRenderer: params => {
      let eIconGui = document.createElement('span');  
      if(params.data.verified==true){
        return  eIconGui.innerHTML = '<em class="material-icons" style="color: green;font-weight: 800;">check</em>';         
      }else{
        return  eIconGui.innerHTML = '<em class="material-icons" style="color: red;font-weight: 800;">close</em>';          
      }    
    }
  },
    {field: 'public',
    cellRenderer: params => {
      let eIconGui = document.createElement('span');  
      if(params.data.public==true){
        return  eIconGui.innerHTML = '<em class="material-icons" style="color: green;font-weight: 800;">check</em>';         
      }else{
        return  eIconGui.innerHTML = '<em class="material-icons" style="color: red;font-weight: 800;">close</em>';          
      }  
    }}    
  ];
  frameworkComponents = {
    institutionRenderer: InstitutionProfileRendererComponent,
    memberprofileRenderer:MemberProfileRendererComponent
  };
  gridOptions: GridOptions;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,

    private store: Store
  ) {
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this,
      },
    };
  }

  fetchInstitutions(searchParams: SearchParams) {
    this.store.dispatch(new FetchInstitutionsAction({ searchParams }));
  }

  createInstitution() {
    this.store.dispatch(new ResetInstitutionFormAction());
    this.router.navigateByUrl(uiroutes.INSTITUTION_FORM_ROUTE.route);
  }

  forceRefetchInstitutions(searchParams: SearchParams) {
    this.store.dispatch(new ForceRefetchInstitutionsAction());
  }

  openInstitutionProfile(rowData) {
    const dialogRef = this.dialog.open(InstitutionModalComponent, {
      data: rowData,
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$))
    .pipe(takeUntil(this.destroy$))
    .subscribe((result) => {
      if(result?.event=='institution'){
        this.router.navigate([uiroutes.INSTITUTION_FORM_ROUTE.route], {
      relativeTo: this.route,
      queryParams: { id:result['data'] },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    })

  }


    });
  }

  openMemberProfile(rowData) {
    const dialogRef = this.dialog.open(MemberProfileComponent, {
      data: rowData?.author,
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
