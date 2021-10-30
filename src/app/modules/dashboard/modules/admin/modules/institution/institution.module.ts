import { NgModule } from '@angular/core';
import { InstitutionModalComponent } from './components/institution-modal/institution-modal.component';
import { InstitutionsTableComponent } from './components/institutions-table/institutions-table.component';
import { InstitutionProfileRendererComponent } from 'src/app/modules/dashboard/modules/admin/modules/institution/components/institution-profile-cell-renderer/institution-profile-renderer.component';
import { AddEditInstitutionComponent } from './components/add-edit-institution/add-edit-institution.component';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { InstitutionState } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.state';
import { NgxsModule } from '@ngxs/store';
import { MasterGridModule } from 'src/app/shared/modules/master-grid/master-grid.module';
import { InstitutionRoutingModule } from './institution-routing.module';

const declarations = [
  AddEditInstitutionComponent,
  InstitutionProfileRendererComponent,
  InstitutionsTableComponent,
  InstitutionModalComponent,
];

const imports = [SharedModule, MasterGridModule, InstitutionRoutingModule];

@NgModule({
  declarations,
  exports: [...declarations],
  imports: [...imports, NgxsModule.forFeature([InstitutionState])],
})
export class InstitutionModule {}
