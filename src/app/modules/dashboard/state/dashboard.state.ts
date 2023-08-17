import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import {
  DashboardStateModel,
  defaultDashboardState,
  unreadCountType,
} from './dashboard.model';

import { Injectable, OnDestroy } from '@angular/core';
import { ClearServerCacheAction, GetUnreadCountAction } from './dashboard.actions';
import { Apollo } from 'apollo-angular';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { DASHBOARD_MUTATIONS } from 'src/app/shared/api/graphql/queries.graphql';
import { ADMIN_MUTATIONS } from 'src/app/shared/api/graphql/mutations.graphql';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@State<DashboardStateModel>({
  name: 'dashboardState',
  defaults: defaultDashboardState,
})
@Injectable()
export class DashboardState implements OnDestroy{
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private apollo: Apollo, private store: Store) {}

  @Selector()
  static getUnreadCount(state: DashboardStateModel): unreadCountType {
    return {
      announcements: state.unreadAnnouncements,
      assignments: state.unreadAssignments,
    };
  }

  @Action(GetUnreadCountAction)
  getAuthStorage({ patchState }: StateContext<DashboardStateModel>) {
    this.apollo
      .query({
        query: DASHBOARD_MUTATIONS.GET_UNREAD_COUNT,
        fetchPolicy: 'network-only',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ({ data }: any) => {
          const response = data.unreadCount;
          patchState({
            unreadAnnouncements: response.announcements,
            unreadAssignments: response.assignments,
          });
        },
        (error) => {
          console.error('There was an error ', error);
          this.store.dispatch(
            new ShowNotificationAction({
              message: 'There was an error!',
              action: 'error',
            })
          );
        }
      );
  }

  @Action(ClearServerCacheAction)
  clearServerCache() {
    this.apollo
      .mutate({
        mutation: ADMIN_MUTATIONS.CLEAR_SERVER_CACHE,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ({ data }: any) => {
          console.log({data})
        },
        (error) => {
          console.error('There was an error ', error);
          this.store.dispatch(
            new ShowNotificationAction({
              message: 'There was an error!',
              action: 'error',
            })
          );
        }
      );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
