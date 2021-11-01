import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { CourseModule } from '../course/course.module';
import {
  CriterionRemarkInputDialog,
  ExerciseKeyDialog,
  GradingDashboardComponent,
  SubmissionHistoryDialog,
} from './components/grading-dashboard/grading-dashboard.component';

const declarations = [
  GradingDashboardComponent,
  ExerciseKeyDialog,
  SubmissionHistoryDialog,
  CriterionRemarkInputDialog,
];
const imports = [SharedModule, CourseModule];

@NgModule({
  declarations,
  imports: [...imports, NgxsModule.forFeature([])],
  exports: [...declarations, ...imports],
})
export class GradingModule {}
