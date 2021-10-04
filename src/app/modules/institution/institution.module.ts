import { NgModule } from '@angular/core';
import { InstitutionModalComponent } from './components/institution-modal/institution-modal.component';
import { InstitutionsTableComponent } from './components/institutions-table/institutions-table.component';
import { InstitutionProfileComponent } from './components/institution-profile/institution-profile.component';
import { InstitutionProfileRendererComponent } from 'src/app/shared/cell-renderers/institution-profile/institution-profile-renderer.component';
import { AddEditInstitutionComponent } from './components/add-edit-institution/add-edit-institution.component';

import { SharedModule } from 'src/app/shared/modules/shared.module';
import { InstitutionState } from 'src/app/shared/state/institutions/institution.state';
import { NgxsModule } from '@ngxs/store';
import { MasterGridModule } from 'src/app/shared/abstract/master-grid/master-grid.module';

const declarations = [
  AddEditInstitutionComponent,
  InstitutionProfileRendererComponent,
  InstitutionsTableComponent,
  InstitutionProfileComponent,
  InstitutionModalComponent,
];

const imports = [
  SharedModule,
  MasterGridModule,
  NgxsModule.forFeature([InstitutionState]),
];

@NgModule({
  declarations,
  exports: [...declarations],
  imports,
})
export class InstitutionModule {}
