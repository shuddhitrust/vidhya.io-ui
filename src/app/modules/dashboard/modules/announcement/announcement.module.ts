import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/modules/shared.module';

const declarations = [];
const imports = [SharedModule];

@NgModule({
  declarations,
  imports,
  exports: [...declarations, ...imports],
})
export class AnnouncementModule {}
