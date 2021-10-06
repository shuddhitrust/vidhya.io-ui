import { State, Action, Selector, StateContext, Store } from '@ngxs/store';
import { defaultOptionsState, OptionsStateModel } from './options.model';
import {
  FetchAdminGroupOptions,
  FetchMemberOptionsByInstitution,
} from './options.actions';
import { Injectable } from '@angular/core';
import { MatSelectOption } from '../../common/models';
import { getErrorMessageFromGraphQLResponse } from '../../common/functions';
import { GROUP_QUERIES, USER_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { ShowNotificationAction } from '../notifications/notification.actions';

@State<OptionsStateModel>({
  name: 'optionsState',
  defaults: defaultOptionsState,
})
@Injectable()
export class OptionsState {
  constructor(private apollo: Apollo, private store: Store) {}

  @Selector()
  static listMembersByInstitution(state: OptionsStateModel): MatSelectOption[] {
    const options = state.membersByInstitution.map((m) => {
      return { value: m.id, label: `${m.name} (${m.role?.name})` };
    });

    return options;
  }

  @Selector()
  static getIsFetchingMembersByInstitution(state: OptionsStateModel): boolean {
    return state.isFetchingMembersByInstitution;
  }

  @Selector()
  static listClassesByInstitution(state: OptionsStateModel): MatSelectOption[] {
    // const options = state.groupsByInstitution
    //   .filter((group: any) => group.type === GroupType.CLASS)
    //   .map((m) => {
    //     return {
    //       value: m.id,
    //       label: `${m.name} (${getOptionLabel(m.type, groupTypeOptions)})`,
    //     };
    //   });
    //
    // return options;
    return [];
  }
  @Selector()
  static listGroupAdminOptions(state: OptionsStateModel): MatSelectOption[] {
    const options = state.adminGroups.map((g) => {
      return { value: g.id, label: `${g.name} (${g.groupType})` };
    });
    return options;
  }

  @Selector()
  static getIsFetchingGroupsByInstitution(state: OptionsStateModel): boolean {
    return state.isFetchingMembersByInstitution;
  }

  @Action(FetchMemberOptionsByInstitution)
  fetchMembersByInstitution(
    { getState, patchState }: StateContext<OptionsStateModel>,
    { payload }: FetchMemberOptionsByInstitution
  ) {
    patchState({ isFetchingMembersByInstitution: true });
    const variables = {
      institutionId: payload.memberInstitutionId,
      membershipStatusIs: ['AP'],
    };

    this.apollo
      .watchQuery({
        query: USER_QUERIES.GET_USERS,
        variables,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          patchState({ isFetchingMembersByInstitution: false });
          const response = data.users.records;
          patchState({
            membersByInstitution: response,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
        }
      );
  }

  @Action(FetchAdminGroupOptions)
  fetchGroupsByInstitution({
    getState,
    patchState,
  }: StateContext<OptionsStateModel>) {
    const state = getState();
    let { isFetchingAdminGroups, adminGroups } = state;
    isFetchingAdminGroups = true;
    patchState({ isFetchingAdminGroups });
    this.apollo
      .watchQuery({
        query: GROUP_QUERIES.GET_ADMIN_GROUPS,
      })
      .valueChanges.subscribe(
        (res: any) => {
          isFetchingAdminGroups = false;
          adminGroups = res?.data?.adminGroups;
          patchState({
            adminGroups,
            isFetchingAdminGroups,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
        }
      );
  }
}
