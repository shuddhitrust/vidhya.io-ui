import { NgModule } from '@angular/core';
import { InstitutionModalComponent } from './components/institution-modal/institution-modal.component';
import { InstitutionsTableComponent } from './components/institutions-table/institutions-table.component';
import { InstitutionProfileComponent } from './components/institution-profile/institution-profile.component';
import { InstitutionProfileRendererComponent } from 'src/app/shared/cell-renderers/institution-profile/institution-profile-renderer.component';
import { AddEditInstitutionComponent } from './components/add-edit-institution/add-edit-institution.component';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { InstitutionState } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.state';
import { NgxsModule } from '@ngxs/store';
import { MasterGridModule } from 'src/app/shared/abstract/master-grid/master-grid.module';
import { InstitutionRoutingModule } from './institution-routing.module';

const declarations = [
  AddEditInstitutionComponent,
  InstitutionProfileRendererComponent,
  InstitutionsTableComponent,
  InstitutionProfileComponent,
  InstitutionModalComponent,
];

const imports = [SharedModule, MasterGridModule, InstitutionRoutingModule];

@NgModule({
  declarations,
  exports: [...declarations],
  imports: [...imports, NgxsModule.forFeature([InstitutionState])],
})
export class InstitutionModule {}
