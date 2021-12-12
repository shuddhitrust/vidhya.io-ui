import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AddEditIssueComponent } from './components/add-edit-issue/add-edit-issue.component';
import { IssueProfileComponent } from './components/issue-profile/issue-profile.component';
import { IssueFeedComponent } from './components/issue-feed/issue-feed.component';
import { IssueRoutingModule } from './issue-routing.module';
import { IssueState } from './state/issue.state';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { markedOptionsFactory } from 'src/app/shared/common/constants';
import { HttpClient } from '@angular/common/http';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { OwnIssuesComponent } from './components/own-issues/own-issues.component';

const declarations = [
  IssueFeedComponent,
  IssueProfileComponent,
  OwnIssuesComponent,
];
const imports = [SharedModule, InfiniteScrollModule, LMarkdownEditorModule];

@NgModule({
  declarations,
  imports: [
    ...imports,
    NgxsModule.forFeature([IssueState]),
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    IssueRoutingModule,
  ],
  exports: [...declarations, ...imports],
})
export class IssueModule {}
