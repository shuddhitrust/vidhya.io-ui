import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  autoGenOptions,
  constructUserFullName,
} from 'src/app/shared/common/functions';
import {
  ExerciseSubmission,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchExerciseSubmissionsAction,
  FetchGradingGroupsAction,
  FetchNextExerciseSubmissionsAction,
} from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.actions';
import { GradingGroup } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.model';
import { ExerciseSubmissionState } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.state';

const groupByTypes = {
  [resources.COURSE]: resources.COURSE,
  [resources.CHAPTER]: resources.CHAPTER,
  EXERCISE: resources.EXERCISE_SUBMISSION,
};

@Component({
  selector: 'app-grading-dashboard',
  templateUrl: './grading-dashboard.component.html',
  styleUrls: [
    './grading-dashboard.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class GradingDashboardComponent implements OnInit {
  opened: boolean = true;
  resource: string = resources.GRADING;
  resourceActions = RESOURCE_ACTIONS;
  groupByOptions: MatSelectOption[] = autoGenOptions(groupByTypes);
  groupBy: string = resources.EXERCISE_SUBMISSION;
  gradingGroupColumnFilters = { groupBy: this.groupBy };
  // uniqueExerciseIds: number[]=[];
  // uniqueChapterIds: number[]=[];
  // uniqueCourseIds: number[]=[];
  groupedCards: GradingGroup[] = [];
  @Select(ExerciseSubmissionState.listGradingGroups)
  gradingGroups$: Observable<GradingGroup[]>;
  gradingGroups: GradingGroup[];

  @Select(ExerciseSubmissionState.isFetchingGradingGroups)
  isFetchingGradingGroup$: Observable<boolean>;
  isFetchingGradingGroup: boolean;
  @Select(ExerciseSubmissionState.listExerciseSubmissions)
  exerciseSubmissions$: Observable<ExerciseSubmission[]>;
  exerciseSubmissions: ExerciseSubmission[];

  @Select(ExerciseSubmissionState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.gradingGroups$.subscribe((val) => {
      this.gradingGroups = val;
    });
    this.isFetchingGradingGroup$.subscribe((val) => {
      this.isFetchingGradingGroup = val;
    });
    this.exerciseSubmissions$.subscribe((val) => {
      this.exerciseSubmissions = val;
      // const allChapterIds = this.exerciseSubmissions.map(e => e.chapter?.id);
      // this.uniqueChapterIds = [...new Set(allChapterIds)];
      // const allCourseIds = this.exerciseSubmissions.map(e => e.course?.id);
      // this.uniqueCourseIds = [...new Set(allCourseIds)];
      // const allExerciseIds = this.exerciseSubmissions.map(e => e.exercise?.id);
      // this.uniqueExerciseIds = [...new Set(allExerciseIds)];
    });
    this.gradingGroupColumnFilters = { groupBy: this.groupBy };
    this.store.dispatch(
      new FetchGradingGroupsAction({
        searchParams: {
          ...defaultSearchParams,
          columnFilters: this.gradingGroupColumnFilters,
        },
      })
    );
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
    console.log({ groupByOptions: this.groupByOptions });
  }
  // organizeGroupCards() {
  //   switch(this.groupBy){
  //     case resources.EXERCISE_SUBMISSION:
  //       this.groupedCards = this.uniqueExerciseIds.map(id => {
  //         let card = Object.assign({}, emptyGradingGroup);
  //         const sampleEntity = this.exerciseSubmissions.find(e => e.id == id )
  //         card.title = sampleEntity.exercise?.prompt;
  //         card.subtitle = "Question Type: " + sampleEntity.exercise?.questionType;
  //         card.count = this.exerciseSubmissions.
  //         return card;
  //       })
  //       break;
  //     case resources.CHAPTER:
  //       break;
  //     case resources.COURSE:
  //       break;
  //   }
  //   this.groupedCards =
  // }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }
  constructUserName(user) {
    return constructUserFullName(user);
  }

  ngOnInit(): void {}
  onScroll() {
    console.log('scrolling groups');
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextExerciseSubmissionsAction());
    }
  }
  createExerciseSubmission() {
    this.router.navigateByUrl(uiroutes.GRADING_FORM_ROUTE.route);
  }

  openExerciseSubmission(exerciseSubmission) {
    this.router.navigate([uiroutes.GRADING_PROFILE_ROUTE.route], {
      queryParams: { id: exerciseSubmission.id },
    });
  }
}
