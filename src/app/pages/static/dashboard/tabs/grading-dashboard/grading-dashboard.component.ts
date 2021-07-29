import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  ExerciseSubmission,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchExerciseSubmissionsAction,
  FetchNextExerciseSubmissionsAction,
} from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.actions';
import { ExerciseSubmissionState } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.state';

@Component({
  selector: 'app-grading-dashboard',
  templateUrl: './grading-dashboard.component.html',
  styleUrls: [
    './grading-dashboard.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class GradingDashboardComponent implements OnInit {
  resource: string = resources.GRADING;
  resourceActions = RESOURCE_ACTIONS;

  @Select(ExerciseSubmissionState.listExerciseSubmissions)
  exerciseSubmissions$: Observable<ExerciseSubmission[]>;

  @Select(ExerciseSubmissionState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.store.dispatch(
      new FetchExerciseSubmissionsAction({ searchParams: defaultSearchParams })
    );
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }
  constructUserName(user) {
    return this.constructUserName(user)
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
