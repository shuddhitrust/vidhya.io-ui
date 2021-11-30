import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AddEditProjectComponent } from './components/add-edit-project/add-edit-project.component';
import { ProjectProfileComponent } from './components/project-profile/project-profile.component';
import { ProjectFeedComponent } from './components/project-feed/project-feed.component';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectState } from './state/project.state';

const declarations = [
  ProjectFeedComponent,
  ProjectProfileComponent,
  AddEditProjectComponent,
];
const imports = [SharedModule];

@NgModule({
  declarations,
  imports: [
    ...imports,
    NgxsModule.forFeature([ProjectState]),
    ProjectRoutingModule,
  ],
  exports: [...declarations, ...imports],
})
export class ProjectModule {}
