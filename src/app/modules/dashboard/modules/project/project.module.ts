import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AddEditProjectComponent } from './components/add-edit-project/add-edit-project.component';
import { ProjectProfileComponent } from './components/project-profile/project-profile.component';
import { ProjectFeedComponent } from './components/project-feed/project-feed.component';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectState } from './state/project.state';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { markedOptionsFactory } from 'src/app/shared/common/constants';
import { HttpClient } from '@angular/common/http';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

const declarations = [
  ProjectFeedComponent,
  ProjectProfileComponent,
  AddEditProjectComponent,
];
const imports = [SharedModule, InfiniteScrollModule, LMarkdownEditorModule];

@NgModule({
  declarations,
  imports: [
    ...imports,
    NgxsModule.forFeature([ProjectState]),
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    ProjectRoutingModule,
  ],
  exports: [...declarations, ...imports],
})
export class ProjectModule {}
