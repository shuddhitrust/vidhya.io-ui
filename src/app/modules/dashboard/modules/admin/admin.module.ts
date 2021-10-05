import { NgModule } from '@angular/core';
import { InstitutionModule } from './modules/institution/institution.module';

const imports = [InstitutionModule];

@NgModule({
  imports,
  exports: imports,
})
export class AdminModule {}
