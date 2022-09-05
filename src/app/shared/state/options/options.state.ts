import { State, Action, Selector, StateContext, Store } from '@ngxs/store';
import { defaultOptionsState, OptionsStateModel } from './options.model';
import {
  FetchAdminGroupOptions,
  FetchGraders,
  FetchMemberOptionsByInstitution,
} from './options.actions';
import { Injectable } from '@angular/core';
import { groupTypeOptions, MatSelectOption } from '../../common/models';
import {
  getErrorMessageFromGraphQLResponse,
  getOptionLabel,
} from '../../common/functions';
import { GROUP_QUERIES, USER_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { ShowNotificationAction } from '../notifications/notification.actions';
import { USER_ROLES_NAMES } from '../../common/constants';

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
  static listGraders(state: OptionsStateModel): MatSelectOption[] {
    const options = state.graders.map((m) => {
      return { value: m.id, label: `${m.name} (${m.role?.name})` };
    });

    return options;
  }

  @Selector()
  static getIsFetchingMembersByInstitution(state: OptionsStateModel): boolean {
    return state.isFetchingMembersByInstitution;
  }

  @Selector()
  static getIsFetchingGraders(state: OptionsStateModel): boolean {
    return state.isFetchingGraders;
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
  static listAdminGroupOptions(state: OptionsStateModel): MatSelectOption[] {
    const options = state.adminGroups.map((g) => {
      return {
        value: g.id,
        label: `${g.name} (${getOptionLabel(g.groupType, groupTypeOptions)})`,
      };
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
      .query({
        query: USER_QUERIES.GET_USERS_OPTIONS,
        variables,
      })
      .subscribe(
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

  @Action(FetchGraders)
  fetchGraders({ patchState }: StateContext<OptionsStateModel>) {
    patchState({ isFetchingGraders: true });
    const variables = {
      roles: [USER_ROLES_NAMES.GRADER, USER_ROLES_NAMES.SUPER_ADMIN],
    };

    this.apollo
      .query({
        query: USER_QUERIES.GET_USERS_OPTIONS,
        variables,
      })
      .subscribe(
        ({ data }: any) => {
          patchState({ isFetchingGraders: false });
          const response = data.users.records;
          patchState({
            graders: response,
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
      .query({
        query: GROUP_QUERIES.GET_ADMIN_GROUP_OPTIONS,
      })
      .subscribe(
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
