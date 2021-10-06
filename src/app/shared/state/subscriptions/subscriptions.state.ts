import { Action, Select, State, StateContext, Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import {
  defaultSubscriptionsState,
  SubscriptionsStateModel,
} from './subscriptions.model';
import { AuthorizationService } from '../../api/authorization/authorization.service';
import { InitiateSubscriptionsAction } from './subscriptions.actions';
import { AnnouncementSubscriptionAction } from '../../../modules/dashboard/modules/announcement/state/announcement.actions';
import { ChapterSubscriptionAction } from '../../../modules/dashboard/modules/course/state/chapters/chapter.actions';
import { MemberSubscriptionAction } from '../../../modules/dashboard/modules/admin/modules/member/state/member.actions';
import { InstitutionSubscriptionAction } from '../../../modules/dashboard/modules/admin/modules/institution/state/institutions/institution.actions';
import { resources, RESOURCE_ACTIONS } from '../../common/models';
import { Observable } from 'rxjs';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { CourseSubscriptionAction } from 'src/app/modules/dashboard/modules/course/state/courses/course.actions';
import { CourseSectionSubscriptionAction } from 'src/app/modules/dashboard/modules/course/state/courseSections/courseSection.actions';
import { ExerciseKeySubscriptionAction } from 'src/app/modules/dashboard/modules/course/state/exerciseKeys/exerciseKey.actions';
import { ExerciseSubscriptionAction } from 'src/app/modules/dashboard/modules/course/state/exercises/exercise.actions';
import { ExerciseSubmissionSubscriptionAction } from 'src/app/modules/dashboard/modules/course/state/exerciseSubmissions/exerciseSubmission.actions';
import { GroupSubscriptionAction } from 'src/app/modules/dashboard/modules/group/state/group.actions';
import { ReportSubscriptionAction } from 'src/app/modules/dashboard/modules/report/state/report.actions';
// import { ChatMessageSubscriptionAction } from 'src/app/modules/dashboard/modules/chat/state/chat.actions';

@State<SubscriptionsStateModel>({
  name: 'subscriptionState',
  defaults: defaultSubscriptionsState,
})
@Injectable()
export class SubscriptionsState {
  @Select(AuthState.getIsFullyAuthenticated)
  isFullyAuthenticated$: Observable<boolean>;
  isFullyAuthenticated: boolean = false;
  constructor(private auth: AuthorizationService, private store: Store) {
    this.isFullyAuthenticated$.subscribe((val) => {
      if (this.isFullyAuthenticated == false && val) {
        this.isFullyAuthenticated = val;
        // this.store.dispatch(new InitiateSubscriptionsAction());
      }
    });
  }

  @Action(InitiateSubscriptionsAction)
  initiateSubscriptions({
    getState,
    patchState,
  }: StateContext<SubscriptionsStateModel>) {
    const authorizeResourceListMethod = (resource) => {
      return this.auth.authorizeResource(resource, RESOURCE_ACTIONS.LIST);
    };
    const state = getState();
    const { subscriptionsInitiated } = state;
    if (!subscriptionsInitiated && this.isFullyAuthenticated) {
      if (authorizeResourceListMethod(resources.ANNOUNCEMENT)) {
        this.store.dispatch(new AnnouncementSubscriptionAction());
      }

      if (authorizeResourceListMethod(resources.CHAPTER)) {
        this.store.dispatch(new ChapterSubscriptionAction());
      }

      // if (authorizeResourceListMethod(resources.CHAT)) {
      //   this.store.dispatch(new ChatMessageSubscriptionAction());
      // }

      if (authorizeResourceListMethod(resources.COURSE)) {
        this.store.dispatch(new CourseSubscriptionAction());
      }

      if (authorizeResourceListMethod(resources.COURSE)) {
        this.store.dispatch(new CourseSectionSubscriptionAction());
      }

      if (authorizeResourceListMethod(resources.EXERCISE_KEY)) {
        this.store.dispatch(new ExerciseKeySubscriptionAction());
      }

      if (authorizeResourceListMethod(resources.CHAPTER)) {
        this.store.dispatch(new ExerciseSubscriptionAction());
      }

      if (authorizeResourceListMethod(resources.EXERCISE_SUBMISSION)) {
        this.store.dispatch(new ExerciseSubmissionSubscriptionAction());
      }

      if (authorizeResourceListMethod(resources.GROUP)) {
        this.store.dispatch(new GroupSubscriptionAction());
      }

      if (authorizeResourceListMethod(resources.INSTITUTION)) {
        this.store.dispatch(new InstitutionSubscriptionAction());
      }

      if (authorizeResourceListMethod(resources.MEMBER)) {
        this.store.dispatch(new MemberSubscriptionAction());
      }

      if (authorizeResourceListMethod(resources.REPORT)) {
        this.store.dispatch(new ReportSubscriptionAction());
      }
    }
    patchState({
      subscriptionsInitiated: true,
    });
  }
}
