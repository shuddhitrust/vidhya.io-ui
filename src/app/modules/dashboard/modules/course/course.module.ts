import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { MasterGridModule } from 'src/app/shared/modules/master-grid/master-grid.module';
import { markedOptionsFactory } from 'src/app/shared/common/constants';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ChapterState } from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.state';
import { CourseDashboardComponent } from './components/course-dashboard/course-dashboard.component';
import { AddEditChapterComponent } from './components/forms/add-edit-chapter/add-edit-chapter.component';
import { AddEditCourseComponent } from './components/forms/add-edit-course/add-edit-course.component';
import { CourseSectionModalComponent } from './components/modals/course-section-modal/course-section-modal.component';
import { ChapterProfileComponent } from './components/profiles/chapter-profile/chapter-profile.component';
import { ChapterDraftComponent } from './components/profiles/chapter-profile/draft/chapter-draft.component';
import {
  ChapterPublishedComponent,
  ExerciseRubricDialog,
} from './components/profiles/chapter-profile/published/chapter-published.component';
import { CourseProfileComponent } from './components/profiles/course-profile/course-profile.component';
import { CourseSectionState } from './state/courseSections/courseSection.state';
import { ExerciseKeyState } from './state/exerciseKeys/exerciseKey.state';
import { CourseState } from './state/courses/course.state';
import { ExerciseState } from './state/exercises/exercise.state';
import { ExerciseSubmissionState } from './state/exerciseSubmissions/exerciseSubmission.state';
import { CourseRoutingModule } from './course-routing.module';

const declarations = [
  CourseDashboardComponent,
  CourseProfileComponent,
  ChapterProfileComponent,
  ChapterDraftComponent,
  ChapterPublishedComponent,
  AddEditCourseComponent,
  AddEditChapterComponent,
  CourseSectionModalComponent,
  ExerciseRubricDialog,
];
const imports = [SharedModule];

@NgModule({
  declarations,
  imports: [
    ...imports,
    MasterGridModule,
    InfiniteScrollModule,
    LMarkdownEditorModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    NgxsModule.forFeature([
      CourseState,
      CourseSectionState,
      ChapterState,
      ExerciseState,
      ExerciseSubmissionState,
      ExerciseKeyState,
    ]),
    CourseRoutingModule,
  ],
  exports: [...declarations, ...imports],
})
export class CourseModule {}
