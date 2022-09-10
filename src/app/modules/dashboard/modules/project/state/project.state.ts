import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultProjectState,
  emptyProjectFormRecord,
  ProjectFormCloseURL,
  ProjectStateModel,
} from './project.model';

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import {
  FetchParams,
  Project,
  MatSelectOption,
  startingFetchParams,
  SUBSCRIPTION_METHODS,
} from 'src/app/shared/common/models';
import {
  CreateUpdateProjectAction,
  DeleteProjectAction,
  FetchProjectsAction,
  FetchNextProjectsAction,
  ForceRefetchProjectsAction,
  GetProjectAction,
  ProjectSubscriptionAction,
  ResetProjectFormAction,
  ClapProjectAction,
} from './project.actions';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import {
  convertPaginatedListToNormalList,
  getErrorMessageFromGraphQLResponse,
  paginatedSubscriptionUpdater,
  updateFetchParams,
} from 'src/app/shared/common/functions';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { PROJECT_QUERIES } from 'src/app/shared/api/graphql/queries.graphql';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { SUBSCRIPTIONS } from 'src/app/shared/api/graphql/subscriptions.graphql';
import { PROJECT_MUTATIONS } from 'src/app/shared/api/graphql/mutations.graphql';

@State<ProjectStateModel>({
  name: 'projectState',
  defaults: defaultProjectState,
})
@Injectable()
export class ProjectState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listProjects(state: ProjectStateModel): Project[] {
    return state.projects;
  }

  @Selector()
  static isFetching(state: ProjectStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: ProjectStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listProjectOptions(state: ProjectStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.projects.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.title,
      };
      return option;
    });

    return options;
  }

  @Selector()
  static errorFetching(state: ProjectStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: ProjectStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: ProjectStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getProjectFormRecord(state: ProjectStateModel): Project {
    return state.projectFormRecord;
  }

  @Action(ForceRefetchProjectsAction)
  forceRefetchProjects({
    getState,
    patchState,
  }: StateContext<ProjectStateModel>) {
    const state = getState();
    let previousFetchParams =
      state.fetchParamObjects[state.fetchParamObjects.length - 1];
    previousFetchParams = previousFetchParams
      ? previousFetchParams
      : startingFetchParams;
    const pageNumber = previousFetchParams?.currentPage;
    const previousSearchParams: SearchParams = {
      pageNumber,
      pageSize: previousFetchParams?.pageSize,
      searchQuery: previousFetchParams?.searchQuery,
      columnFilters: previousFetchParams?.columnFilters,
    };
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchProjectsAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchNextProjectsAction)
  fetchNextProjects({ getState }: StateContext<ProjectStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPage;
    let previousFetchParams =
      state.fetchParamObjects[state.fetchParamObjects.length - 1];
    previousFetchParams = previousFetchParams
      ? previousFetchParams
      : startingFetchParams;
    const pageNumber = previousFetchParams.currentPage + 1;
    const newSearchParams: SearchParams = {
      pageNumber,
      pageSize: previousFetchParams.pageSize,
      searchQuery: previousFetchParams.searchQuery,
      columnFilters: previousFetchParams.columnFilters,
    };
    if (
      !lastPageNumber ||
      (lastPageNumber != null && pageNumber <= lastPageNumber)
    ) {
      this.store.dispatch(
        new FetchProjectsAction({ searchParams: newSearchParams })
      );
    }
  }
  @Action(FetchProjectsAction)
  fetchProjects(
    { getState, patchState }: StateContext<ProjectStateModel>,
    { payload }: FetchProjectsAction
  ) {
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects } = state;
    const { searchQuery, pageSize, pageNumber, columnFilters } = searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber: pageNumber,
      newPageSize: pageSize,
      newSearchQuery: searchQuery,
      newColumnFilters: columnFilters,
    });
    const variables = {
      searchField: searchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
      sortBy: newFetchParams.columnFilters?.sortBy,
      authorId: newFetchParams.columnFilters?.authorId,
    };
    patchState({ isFetching: true });
    this.store.dispatch(
      new ToggleLoadingScreen({
        message: 'Fetching projects...',
        showLoadingScreen: true,
      })
    );
    this.apollo
      .query({
        query: PROJECT_QUERIES.GET_PROJECTS,
        variables,
        // fetchPolicy,
      })
      .subscribe(
        ({ data }: any) => {
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
            })
          );
          const response = data.projects;
          newFetchParams = { ...newFetchParams };
          let paginatedProjects = state.paginatedProjects;
          paginatedProjects = {
            ...paginatedProjects,
            [pageNumber]: response,
          };

          let projects = convertPaginatedListToNormalList(paginatedProjects);
          let lastPage = null;
          if (response.length < newFetchParams.pageSize) {
            lastPage = newFetchParams.currentPage;
          }
          patchState({
            projects,
            paginatedProjects,
            lastPage,
            fetchParamObjects: state.fetchParamObjects.concat([newFetchParams]),
            isFetching: false,
          });
        },
        (error) => {
          this.store.dispatch(
            new ShowNotificationAction({
              message: getErrorMessageFromGraphQLResponse(error),
              action: 'error',
            })
          );
          patchState({ isFetching: false });
        }
      );
  }

  // @Action(ProjectSubscriptionAction)
  // subscribeToProjects({
  //   getState,
  //   patchState,
  // }: StateContext<ProjectStateModel>) {
  //   const state = getState();
  //   if (!state.projectsSubscribed) {
  //     this.apollo
  //       .subscribe({
  //         query: SUBSCRIPTIONS.project,
  //       })
  //       .subscribe((result: any) => {
  //         const state = getState();
  //         const method = result?.data?.notifyProject?.method;
  //         const project = result?.data?.notifyProject?.project;
  //         const { newPaginatedItems, newItemsList } =
  //           paginatedSubscriptionUpdater({
  //             paginatedItems: state.paginatedProjects,
  //             method,
  //             modifiedItem: project,
  //           });
  //         patchState({
  //           projects: newItemsList,
  //           paginatedProjects: newPaginatedItems,
  //           projectsSubscribed: true,
  //         });
  //       });
  //   }
  // }

  @Action(GetProjectAction)
  getProject(
    { patchState }: StateContext<ProjectStateModel>,
    { payload }: GetProjectAction
  ) {
    const { id, fetchFormDetails } = payload;
    if (id) {
      const query = fetchFormDetails
        ? PROJECT_QUERIES.GET_PROJECT_FORM_DETAILS
        : PROJECT_QUERIES.GET_PROJECT_PROFILE;
      patchState({ isFetching: true });
      this.apollo
        .query({
          query,
          variables: { id },
          fetchPolicy: 'network-only',
        })
        .subscribe(
          ({ data }: any) => {
            const response = data.project;
            patchState({ projectFormRecord: response, isFetching: false });
          },
          (error) => {
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(error),
                action: 'error',
              })
            );
            patchState({ isFetching: false });
          }
        );
    }
  }

  @Action(CreateUpdateProjectAction)
  createUpdateProject(
    { getState, patchState }: StateContext<ProjectStateModel>,
    { payload }: CreateUpdateProjectAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;

      const updateForm = values.id == null ? false : true;
      const { id, ...sanitizedValues } = values;
      const variables = updateForm
        ? {
            input: sanitizedValues,
            id: values.id, // adding id to the mutation variables if it is an update mutation
          }
        : { input: sanitizedValues };

      this.apollo
        .mutate({
          mutation: updateForm
            ? PROJECT_MUTATIONS.UPDATE_PROJECT
            : PROJECT_MUTATIONS.CREATE_PROJECT,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm
              ? data.updateProject
              : data.createProject;
            patchState({ formSubmitting: false });

            if (response.ok) {
              const username = response.project?.author?.username;
              const method = updateForm
                ? SUBSCRIPTION_METHODS.UPDATE_METHOD
                : SUBSCRIPTION_METHODS.CREATE_METHOD;
              const project = response.project;
              const { newPaginatedItems, newItemsList } =
                paginatedSubscriptionUpdater({
                  paginatedItems: state.paginatedProjects,
                  method,
                  modifiedItem: project,
                });

              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(ProjectFormCloseURL(username));
              patchState({
                paginatedProjects: newPaginatedItems,
                projects: newItemsList,

                projectFormRecord: emptyProjectFormRecord,
                fetchPolicy: 'network-only',
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Project ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
            } else {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: getErrorMessageFromGraphQLResponse(response?.errors),
                  action: 'error',
                })
              );
            }
          },
          (error) => {
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(error),
                action: 'error',
              })
            );
            patchState({ formSubmitting: false });
          }
        );
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message:
            'Please make sure there are no errors in the form before attempting to submit!',
          action: 'error',
        })
      );
    }
  }

  @Action(ClapProjectAction)
  clapProject(
    { getState, patchState }: StateContext<ProjectStateModel>,
    { payload }: ClapProjectAction
  ) {
    const { id } = payload;
    this.apollo
      .mutate({
        mutation: PROJECT_MUTATIONS.CLAP_PROJECT,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.clapProject;
          const state = getState();
          patchState({
            projectFormRecord: {
              ...state.projectFormRecord,
              claps: response.project.claps,
            },
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

  @Action(DeleteProjectAction)
  deleteProject(
    { getState, patchState }: StateContext<ProjectStateModel>,
    { payload }: DeleteProjectAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: PROJECT_MUTATIONS.DELETE_PROJECT,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteProject;

          if (response.ok) {
            const username = response.project?.author?.username;
            this.router.navigateByUrl(ProjectFormCloseURL(username));
            const method = SUBSCRIPTION_METHODS.DELETE_METHOD;
            const project = response.project;
            const state = getState();
            const { newPaginatedItems, newItemsList } =
              paginatedSubscriptionUpdater({
                paginatedItems: state.paginatedProjects,
                method,
                modifiedItem: project,
              });
            patchState({
              paginatedProjects: newPaginatedItems,
              projects: newItemsList,
              projectFormRecord: emptyProjectFormRecord,
            });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Project deleted successfully!',
                action: 'success',
              })
            );
          } else {
            this.store.dispatch(
              new ShowNotificationAction({
                message: getErrorMessageFromGraphQLResponse(response?.errors),
                action: 'error',
              })
            );
          }
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

  @Action(ResetProjectFormAction)
  resetProjectForm({ patchState }: StateContext<ProjectStateModel>) {
    patchState({
      projectFormRecord: emptyProjectFormRecord,
      formSubmitting: false,
    });
  }
}
