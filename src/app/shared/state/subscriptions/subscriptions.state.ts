import { Action, Select, State, StateContext, Store } from '@ngxs/store';

import { Injectable } from '@angular/core';
import {
  defaultSubscriptionsState,
  SubscriptionsStateModel,
} from './subscriptions.model';
import { AuthorizationService } from '../../api/authorization/authorization.service';
import { InitiateSubscriptionsAction } from './subscriptions.actions';
import { AnnouncementSubscriptionAction } from '../announcements/announcement.actions';
import { ChapterSubscriptionAction } from '../chapters/chapter.actions';
import { ReportSubscriptionAction } from '../reports/report.actions';
import { MemberSubscriptionAction } from '../members/member.actions';
import { InstitutionSubscriptionAction } from '../../../modules/dashboard/modules/admin/modules/institution/state/institutions/institution.actions';
import { GroupSubscriptionAction } from '../groups/group.actions';
import { ExerciseSubmissionSubscriptionAction } from '../exerciseSubmissions/exerciseSubmission.actions';
import { ExerciseSubscriptionAction } from '../exercises/exercise.actions';
import { ExerciseKeySubscriptionAction } from '../exerciseKeys/exerciseKey.actions';
import { CourseSectionSubscriptionAction } from '../courseSections/courseSection.actions';
import { CourseSubscriptionAction } from '../courses/course.actions';
import { ChatMessageSubscriptionAction } from '../chats/chat.actions';
import { resources, RESOURCE_ACTIONS } from '../../common/models';
import { Observable } from 'rxjs';
import { AuthState } from '../auth/auth.state';

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
