import { NgModule } from '@angular/core';
import { SharedModule } from './../../shared/modules/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { NgxsModule } from '@ngxs/store';
import { PublicState } from './state/public/public.state';
import { PublicComponent } from './components/public/public.component';
import { AuthModule } from '../auth/auth.module';
import { ErrorPageComponent } from './components/pages/error/error.component';
import { PublicTabsComponent } from './components/feed/public-lists.component';
import { PublicLearnersFeedComponent } from './components/feed/learners-feed/learners-feed.component';
import { InstitutionProfileComponent } from './components/profiles/public-institution-profile/public-institution-profile.component';
import { InstitutionsFeedComponent } from './components/feed/institutions-feed/institutions-feed.component';
import { HomeComponent } from './components/pages/home/home.component';
import { PasswordResetComponent } from './components/pages/password-reset/password-reset.component';
import { PrivacyComponent } from './components/pages/privacy/privacy.component';
import { PublicUserProfileComponent } from './components/profiles/public-user-profile/public-user-profile.component';
import { UserCoursesComponent } from './components/profiles/public-user-profile/user-profile-tabs/user-profile-courses/user-profile-courses.component';
import { UserProjectsComponent } from './components/profiles/public-user-profile/user-profile-tabs/user-profile-projects/user-profile-projects.component';
import { ProjectModule } from '../dashboard/modules/project/project.module';
import { TermsConditionsComponent } from './components/pages/terms-conditions/terms-conditions.component';
import { AddEditIssueComponent } from '../dashboard/modules/admin/modules/issues/components/add-edit-issue/add-edit-issue.component';
import { PublicNewsFeedComponent } from './components/feed/news-feed/news-feed.component';
import { NewsProfileComponent } from './components/profiles/public-news-profile/public-news-profile.component';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { markedOptionsFactory } from 'src/app/shared/common/constants';

const declarations = [
  HomeComponent,
  PasswordResetComponent,
  AddEditIssueComponent,
  PrivacyComponent,
  TermsConditionsComponent,
  PublicUserProfileComponent,
  PublicComponent,
  ErrorPageComponent,
  PublicTabsComponent,
  PublicLearnersFeedComponent,
  InstitutionsFeedComponent,
  PublicNewsFeedComponent,
  InstitutionProfileComponent,
  NewsProfileComponent,
  UserCoursesComponent,
  UserProjectsComponent,
];

@NgModule({
  declarations,
  exports: [...declarations],
  imports: [
    SharedModule,
    AuthModule,
    ProjectModule,
    PublicRoutingModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    NgxsModule.forFeature([PublicState]),
  ],
})
export class PublicModule {}
