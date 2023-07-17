import { State, Action, Selector, StateContext, Store } from '@ngxs/store';
import { defaultOptionsState, OptionsStateModel } from './options.model';
import {
  FetchAdminGroupOptions,
  FetchGraders,
  FetchMemberOptionsByInstitution,
  FetchInstitutionsOptions,
  searchInstitution,
  FetchDesignationByInstitution} from './options.actions';
import { Injectable } from '@angular/core';
import { groupTypeOptions, MatSelectOption } from '../../common/models';
import {
  getErrorMessageFromGraphQLResponse,
  getOptionLabel,
} from '../../common/functions';
import { GROUP_QUERIES, USER_QUERIES, INSTITUTION_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { ShowNotificationAction } from '../notifications/notification.actions';
import { USER_ROLES_NAMES } from '../../common/constants';
import { error } from 'console';

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
  static listDesignationsByInstitutionsOptions(
    state: OptionsStateModel
  ) {
    return state.designationsByInsitution;
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

  @Selector()
  static listInstitutionOptions(state: OptionsStateModel) {
    let options = {};
    return state.institutionsList['records'];  
  }

  @Selector()
  static getIsFetchingInstitutions(state: OptionsStateModel): boolean {
    return state.isFetchingAllInstitutions;
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


  
  // To Fetch all the Institutios
  @Action(searchInstitution)
  searchInstitution({ getState, patchState }: StateContext<OptionsStateModel>,
    { payload }: searchInstitution
  ) {    
    const state = getState();
    let { isFetchingAllInstitutions, institutionsList, designationsByInsitution } = state;
    isFetchingAllInstitutions = true;
    institutionsList = [];
    designationsByInsitution = [];
    patchState({ isFetchingAllInstitutions,institutionsList,designationsByInsitution });
    const variables = {
      name: payload.name
    };
    this.apollo
      .query({
        query: INSTITUTION_QUERIES.SEARCH_INSTITUTIONS,
        variables,
        fetchPolicy: 'network-only',
      })
      .subscribe(
        (res: any) => {
          isFetchingAllInstitutions = false;
          institutionsList = res?.data?.searchInstitution;
          patchState({
            institutionsList,
            isFetchingAllInstitutions,
          });        
          // institutionsList.filter(option => option.name.toLowerCase().includes(filterValue)
        },error=>{
          new ShowNotificationAction({
            message: getErrorMessageFromGraphQLResponse(error),
            action: 'error',
          })
        })
  }

  // To Fetch all the Institutios
  @Action(FetchDesignationByInstitution)
  FetchDesignationByInstitution({
    getState,
    patchState,
  }: StateContext<OptionsStateModel>,
  { payload }: FetchDesignationByInstitution
  ) {
    const state = getState();
    let { isFetchingDesignationsByInsitution, institutionsList } = state;
    isFetchingDesignationsByInsitution = true;
    patchState({ isFetchingDesignationsByInsitution: true });
    const variables = {
      id: payload.id
    };
    this.apollo
      .query({
        query: INSTITUTION_QUERIES.GET_FETCH_DESIGNATION_BY_INSTITUTION,
        variables        
      })
      .subscribe(
        (res: any) => {
          let designationsList = res?.data?.fetchDesignationByInstitution.designations;
          patchState({ isFetchingDesignationsByInsitution: false });
          const response = designationsList?designationsList.split(','):['NA'];
          patchState({
            designationsByInsitution: response,
          });
        },error=>{
          new ShowNotificationAction({
            message: getErrorMessageFromGraphQLResponse(error),
            action: 'error',
          })
        })
  }

  // To Fetch all the Institutios
  @Action(FetchInstitutionsOptions)
  fetchInstitutions({
    getState,
    patchState,
  }: StateContext<OptionsStateModel>) {
    const state = getState();
    let { isFetchingAllInstitutions, institutionsList } = state;
    isFetchingAllInstitutions = true;
    patchState({ isFetchingAllInstitutions });
    this.apollo
      .query({
        query: INSTITUTION_QUERIES.GET_INSTITUTIONS,
        
      })
      .subscribe(
        (res: any) => {
          isFetchingAllInstitutions = false;
          institutionsList = res?.data?.institutions;
          patchState({
            institutionsList,
            isFetchingAllInstitutions,
          });        
        },error=>{
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
        })
  }
}
