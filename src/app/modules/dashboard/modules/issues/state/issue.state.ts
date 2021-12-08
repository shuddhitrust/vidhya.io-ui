import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultIssueState,
  emptyIssueFormRecord,
  IssueStateModel,
} from './issue.model';

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import {
  FetchParams,
  Issue,
  MatSelectOption,
  startingFetchParams,
  SUBSCRIPTION_METHODS,
} from 'src/app/shared/common/models';
import {
  CreateUpdateIssueAction,
  DeleteIssueAction,
  FetchIssuesAction,
  FetchNextIssuesAction,
  ForceRefetchIssuesAction,
  GetIssueAction,
  IssueSubscriptionAction,
  ResetIssueFormAction,
} from './issue.actions';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import {
  convertPaginatedListToNormalList,
  getErrorMessageFromGraphQLResponse,
  paginatedSubscriptionUpdater,
  updateFetchParams,
} from 'src/app/shared/common/functions';
import { ToggleLoadingScreen } from 'src/app/shared/state/loading/loading.actions';
import { ISSUE_QUERIES } from 'src/app/shared/api/graphql/queries.graphql';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { SUBSCRIPTIONS } from 'src/app/shared/api/graphql/subscriptions.graphql';
import { ISSUE_MUTATIONS } from 'src/app/shared/api/graphql/mutations.graphql';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { ADMIN } from '../../../dashboard.component';

@State<IssueStateModel>({
  name: 'issueState',
  defaults: defaultIssueState,
})
@Injectable()
export class IssueState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listIssues(state: IssueStateModel): Issue[] {
    return state.issues;
  }

  @Selector()
  static isFetching(state: IssueStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: IssueStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listIssueOptions(state: IssueStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.issues.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.link,
      };
      return option;
    });

    return options;
  }

  @Selector()
  static errorFetching(state: IssueStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: IssueStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: IssueStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getIssueFormRecord(state: IssueStateModel): Issue {
    return state.issueFormRecord;
  }

  @Action(ForceRefetchIssuesAction)
  forceRefetchIssues({ getState, patchState }: StateContext<IssueStateModel>) {
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
      new FetchIssuesAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchNextIssuesAction)
  fetchNextIssues({ getState }: StateContext<IssueStateModel>) {
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
        new FetchIssuesAction({ searchParams: newSearchParams })
      );
    }
  }
  @Action(FetchIssuesAction)
  fetchIssues(
    { getState, patchState }: StateContext<IssueStateModel>,
    { payload }: FetchIssuesAction
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
      author: newFetchParams.columnFilters.author,
    };
    patchState({ isFetching: true });
    this.store.dispatch(
      new ToggleLoadingScreen({
        message: 'Fetching issues...',
        showLoadingScreen: true,
      })
    );
    this.apollo
      .watchQuery({
        query: ISSUE_QUERIES.GET_ISSUES,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          this.store.dispatch(
            new ToggleLoadingScreen({
              showLoadingScreen: false,
            })
          );
          const response = data.issues;
          newFetchParams = { ...newFetchParams };
          let paginatedIssues = state.paginatedIssues;
          paginatedIssues = {
            ...paginatedIssues,
            [pageNumber]: response,
          };

          let issues = convertPaginatedListToNormalList(paginatedIssues);
          let lastPage = null;
          if (response.length < newFetchParams.pageSize) {
            lastPage = newFetchParams.currentPage;
          }
          patchState({
            issues,
            paginatedIssues,
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

  // @Action(IssueSubscriptionAction)
  // subscribeToIssues({
  //   getState,
  //   patchState,
  // }: StateContext<IssueStateModel>) {
  //   const state = getState();
  //   if (!state.issuesSubscribed) {
  //     this.apollo
  //       .subscribe({
  //         query: SUBSCRIPTIONS.issue,
  //       })
  //       .subscribe((result: any) => {
  //         const state = getState();
  //         const method = result?.data?.notifyIssue?.method;
  //         const issue = result?.data?.notifyIssue?.issue;
  //         const { newPaginatedItems, newItemsList } =
  //           paginatedSubscriptionUpdater({
  //             paginatedItems: state.paginatedIssues,
  //             method,
  //             modifiedItem: issue,
  //           });
  //         patchState({
  //           issues: newItemsList,
  //           paginatedIssues: newPaginatedItems,
  //           issuesSubscribed: true,
  //         });
  //       });
  //   }
  // }

  @Action(GetIssueAction)
  getIssue(
    { patchState }: StateContext<IssueStateModel>,
    { payload }: GetIssueAction
  ) {
    const { id, fetchFormDetails } = payload;
    const query = fetchFormDetails
      ? ISSUE_QUERIES.GET_ISSUE_FORM_DETAILS
      : ISSUE_QUERIES.GET_ISSUE_PROFILE;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query,
        variables: { id },
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.issue;
          patchState({ issueFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateIssueAction)
  createUpdateIssue(
    { getState, patchState }: StateContext<IssueStateModel>,
    { payload }: CreateUpdateIssueAction
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
            ? ISSUE_MUTATIONS.UPDATE_ISSUE
            : ISSUE_MUTATIONS.CREATE_ISSUE,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm ? data.updateIssue : data.createIssue;
            patchState({ formSubmitting: false });

            if (response.ok) {
              const username = response.issue?.author?.username;
              const method = updateForm
                ? SUBSCRIPTION_METHODS.UPDATE_METHOD
                : SUBSCRIPTION_METHODS.CREATE_METHOD;
              const issue = response.issue;
              const { newPaginatedItems, newItemsList } =
                paginatedSubscriptionUpdater({
                  paginatedItems: state.paginatedIssues,
                  method,
                  modifiedItem: issue,
                });

              form.reset();
              formDirective.resetForm();
              this.router.navigate([uiroutes.DASHBOARD_ROUTE.route], {
                queryParams: {
                  tab: ADMIN,
                },
              });
              patchState({
                paginatedIssues: newPaginatedItems,
                issues: newItemsList,

                issueFormRecord: emptyIssueFormRecord,
                fetchPolicy: 'network-only',
              });
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Issue ${
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

  @Action(DeleteIssueAction)
  deleteIssue(
    { getState, patchState }: StateContext<IssueStateModel>,
    { payload }: DeleteIssueAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: ISSUE_MUTATIONS.DELETE_ISSUE,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteIssue;

          if (response.ok) {
            const username = response.issue?.author?.username;
            this.router.navigate([uiroutes.DASHBOARD_ROUTE.route], {
              queryParams: {
                tab: ADMIN,
              },
            });
            const method = SUBSCRIPTION_METHODS.DELETE_METHOD;
            const issue = response.issue;
            const state = getState();
            const { newPaginatedItems, newItemsList } =
              paginatedSubscriptionUpdater({
                paginatedItems: state.paginatedIssues,
                method,
                modifiedItem: issue,
              });
            patchState({
              paginatedIssues: newPaginatedItems,
              issues: newItemsList,
              issueFormRecord: emptyIssueFormRecord,
            });
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Issue deleted successfully!',
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

  @Action(ResetIssueFormAction)
  resetIssueForm({ patchState }: StateContext<IssueStateModel>) {
    patchState({
      issueFormRecord: emptyIssueFormRecord,
      formSubmitting: false,
    });
  }
}
