import { State, Action, Selector, StateContext, Store } from '@ngxs/store';
import { defaultOptionsState, OptionsStateModel } from './options.model';
import {
  FetchGroupOptionsByInstitution,
  FetchMemberOptionsByInstitution,
} from './options.actions';
import { Injectable } from '@angular/core';
import { MatSelectOption } from '../../common/models';
import {
  getErrorMessageFromGraphQLResponse,
  getOptionLabel,
} from '../../common/functions';
import { groupTypeOptions } from '../groups/group.model';
import { USER_QUERIES } from '../../api/graphql/queries.graphql';
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
      return { value: m.id, label: m.firstName };
    });
    console.log('members by institution options', options);
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
    // console.log('members by institution options', options);
    // return options;
    return [];
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
    };
    console.log('variables for members fetch ', { variables });
    this.apollo
      .watchQuery({
        query: USER_QUERIES.GET_USERS,
        variables,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          patchState({ isFetchingMembersByInstitution: false });
          const response = data.users;
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

  @Action(FetchGroupOptionsByInstitution)
  fetchGroupsByInstitution(
    { getState, patchState }: StateContext<OptionsStateModel>,
    { payload }: FetchGroupOptionsByInstitution
  ) {
    const state = getState();
    let {
      fetchPolicyForGroups,
      isFetchingGroupsByInstitution,
      groupsByInstitution,
    } = state;
    const { groupInstitutionId, filter } = payload;
    isFetchingGroupsByInstitution = true;
    patchState({ isFetchingGroupsByInstitution });
    const variables = {
      id: groupInstitutionId,
      filter: filter ? filter : null,
    };
    console.log('Fetching members by institution ', variables);
    if (groupInstitutionId) {
      // client
      //   .query({
      //     query: customQueries.GetInstitutionGroups,
      //     variables,
      //     fetchPolicy: fetchPolicyForGroups,
      //   })
      //   .then((res: any) => {
      //     console.log('Fetch members by institution Id response => ', res);
      //     isFetchingGroupsByInstitution = false;
      //     groupsByInstitution = res?.data?.getInstitution?.groups?.items;
      //     fetchPolicyForGroups = null;
      //     patchState({
      //       groupsByInstitution,
      //       isFetchingGroupsByInstitution,
      //       fetchPolicyForGroups,
      //     });
      //   })
      //   .catch((err) => {
      //     isFetchingGroupsByInstitution = false;
      //     groupsByInstitution = [];
      //     patchState({ groupsByInstitution, isFetchingGroupsByInstitution });
      //   });
    }
  }
}
