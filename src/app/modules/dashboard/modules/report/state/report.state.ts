import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultReportState,
  emptyReportFormRecord,
  ReportFormCloseURL,
  ReportStateModel,
} from './report.model';

import {
  FetchParams,
  MatSelectOption,
  Report,
  startingFetchParams,
} from 'src/app/shared/common/models';
import {
  CreateUpdateReportAction,
  DeleteReportAction,
  FetchNextReportsAction,
  FetchReportsAction,
  ForceRefetchReportsAction,
  GetReportAction,
  ReportSubscriptionAction,
  ResetReportFormAction,
} from './report.actions';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  getErrorMessageFromGraphQLResponse,
  subscriptionUpdater,
  updateFetchParams,
} from 'src/app/shared/common/functions';
import { REPORT_QUERIES } from 'src/app/shared/api/graphql/queries.graphql';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { SUBSCRIPTIONS } from 'src/app/shared/api/graphql/subscriptions.graphql';
import { REPORT_MUTATIONS } from 'src/app/shared/api/graphql/mutations.graphql';

@State<ReportStateModel>({
  name: 'reportState',
  defaults: defaultReportState,
})
@Injectable()
export class ReportState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listReports(state: ReportStateModel): Report[] {
    return state.reports;
  }

  @Selector()
  static isFetching(state: ReportStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: ReportStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listReportOptions(state: ReportStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.reports.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.participant.firstName,
      };
      return option;
    });

    return options;
  }

  @Selector()
  static errorFetching(state: ReportStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: ReportStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: ReportStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getReportFormRecord(state: ReportStateModel): Report {
    return state.reportFormRecord;
  }

  @Action(ForceRefetchReportsAction)
  forceRefetchReports({
    getState,
    patchState,
  }: StateContext<ReportStateModel>) {
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
      new FetchReportsAction({ searchParams: previousSearchParams })
    );
  }

  @Action(FetchNextReportsAction)
  fetchNextReports({ getState }: StateContext<ReportStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPage;
    const pageNumber =
      state.fetchParamObjects[state.fetchParamObjects.length - 1].currentPage +
      1;
    const newSearchParams: SearchParams = {
      ...defaultSearchParams,
      pageNumber,
    };
    if (
      !lastPageNumber ||
      (lastPageNumber != null && pageNumber <= lastPageNumber)
    ) {
      this.store.dispatch(
        new FetchReportsAction({ searchParams: newSearchParams })
      );
    }
  }

  @Action(FetchReportsAction)
  fetchReports(
    { getState, patchState }: StateContext<ReportStateModel>,
    { payload }: FetchReportsAction
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
    };
    patchState({ isFetching: true });

    this.apollo
      .watchQuery({
        query: REPORT_QUERIES.GET_REPORTS,
        variables,
        fetchPolicy,
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.reports.records;
          const totalCount = data.reports?.total;
          newFetchParams = { ...newFetchParams, totalCount };

          patchState({
            reports: response,
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

  @Action(ReportSubscriptionAction)
  subscribeToReports({ getState, patchState }: StateContext<ReportStateModel>) {
    const state = getState();
    if (!state.reportsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.report,
        })
        .subscribe((result: any) => {
          const state = getState();
          const method = result?.data?.notifyReport?.method;
          const report = result?.data?.notifyReport?.report;
          const { items, fetchParamObjects } = subscriptionUpdater({
            items: state.reports,
            method,
            subscriptionItem: report,
            fetchParamObjects: state.fetchParamObjects,
          });
          patchState({
            reports: items,
            fetchParamObjects,
            reportsSubscribed: true,
          });
        });
    }
  }

  @Action(GetReportAction)
  getReport(
    { patchState }: StateContext<ReportStateModel>,
    { payload }: GetReportAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: REPORT_QUERIES.GET_REPORT,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.report;
          patchState({ reportFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateReportAction)
  createUpdateReport(
    { getState, patchState }: StateContext<ReportStateModel>,
    { payload }: CreateUpdateReportAction
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
            ? REPORT_MUTATIONS.UPDATE_REPORT
            : REPORT_MUTATIONS.CREATE_REPORT,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm ? data.updateReport : data.createReport;
            patchState({ formSubmitting: false });

            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `Report ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(ReportFormCloseURL);
              patchState({
                reportFormRecord: emptyReportFormRecord,
                fetchPolicy: 'network-only',
              });
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

  @Action(DeleteReportAction)
  deleteReport(
    {}: StateContext<ReportStateModel>,
    { payload }: DeleteReportAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: REPORT_MUTATIONS.DELETE_REPORT,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteReport;

          if (response.ok) {
            this.router.navigateByUrl(ReportFormCloseURL);
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Report deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(new ForceRefetchReportsAction());
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

  @Action(ResetReportFormAction)
  resetReportForm({ patchState }: StateContext<ReportStateModel>) {
    patchState({
      reportFormRecord: emptyReportFormRecord,
      formSubmitting: false,
    });
  }
}
