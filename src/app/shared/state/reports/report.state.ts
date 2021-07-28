import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultReportState,
  emptyReportFormRecord,
  ReportFormCloseURL,
  ReportStateModel,
} from './report.model';

import { Injectable } from '@angular/core';
import {
  ReportSubscriptionAction,
  CreateUpdateReportAction,
  DeleteReportAction,
  FetchReportsAction,
  FetchNextReportsAction,
  ForceRefetchReportsAction,
  GetReportAction,
  ResetReportFormAction,
} from './report.actions';
import { REPORT_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import {
  Report,
  MatSelectOption,
  FetchParams,
} from '../../common/models';
import { REPORT_MUTATIONS } from '../../api/graphql/mutations.graphql';
import { ShowNotificationAction } from '../notifications/notification.actions';
import {
  getErrorMessageFromGraphQLResponse,
  fetchParamsNewOrNot,
  subscriptionUpdater,
  updateFetchParams,
} from '../../common/functions';
import { Router } from '@angular/router';
import { defaultSearchParams } from '../../common/constants';
import { SUBSCRIPTIONS } from '../../api/graphql/subscriptions.graphql';
import { SearchParams } from '../../abstract/master-grid/table.model';

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
  static listReportOptions(
    state: ReportStateModel
  ): MatSelectOption[] {
    const options: MatSelectOption[] = state.reports.map((i) => {
      const option: MatSelectOption = {
        value: i.id,
        label: i.title,
      };
      return option;
    });
    console.log('options', options);
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
  static getReportFormRecord(
    state: ReportStateModel
  ): Report {
    return state.reportFormRecord;
  }

  @Action(ForceRefetchReportsAction)
  forceRefetchReports({
    patchState,
  }: StateContext<ReportStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchReportsAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchNextReportsAction)
  fetchNextReports({ getState }: StateContext<ReportStateModel>) {
    const state = getState();
    const lastPageNumber = state.lastPage;
    const newPageNumber =
      state.fetchParamObjects[state.fetchParamObjects.length - 1].currentPage +
      1;
    const newSearchParams: SearchParams = {
      ...defaultSearchParams,
      newPageNumber,
    };
    if (
      !lastPageNumber ||
      (lastPageNumber != null && newPageNumber <= lastPageNumber)
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
    console.log('Fetching reports from report state');
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects, reportsSubscribed } = state;
    const { newSearchQuery, newPageSize, newPageNumber, newColumnFilters } =
      searchParams;
    let newFetchParams = updateFetchParams({
      fetchParamObjects,
      newPageNumber,
      newPageSize,
      newSearchQuery,
      newColumnFilters,
    });
    const variables = {
      searchField: newSearchQuery,
      limit: newFetchParams.pageSize,
      offset: newFetchParams.offset,
    };
    if (fetchParamsNewOrNot({ fetchParamObjects, newFetchParams })) {
      patchState({ isFetching: true });
      console.log('variables for reports fetch ', { variables });
      this.apollo
        .watchQuery({
          query: REPORT_QUERIES.GET_REPORTS,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(
          ({ data }: any) => {
            console.log('resposne to get reports query ', { data });
            const response = data.reports;
            const totalCount = response[0]?.totalCount
              ? response[0]?.totalCount
              : 0;
            newFetchParams = { ...newFetchParams, totalCount };
            console.log('from after getting reports', {
              totalCount,
              response,
              newFetchParams,
            });
            let reports = state.reports;
            reports = reports.concat(response);
            let lastPage = null;
            if (response.length < newFetchParams.pageSize) {
              lastPage = newFetchParams.currentPage;
            }
            patchState({
              lastPage,
              reports,
              fetchParamObjects: state.fetchParamObjects.concat([
                newFetchParams,
              ]),
              isFetching: false,
            });
            if (!reportsSubscribed) {
              this.store.dispatch(new ReportSubscriptionAction());
            }
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

  @Action(ReportSubscriptionAction)
  subscribeToReports({
    getState,
    patchState,
  }: StateContext<ReportStateModel>) {
    const state = getState();
    if (!state.reportsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.report,
        })
        .subscribe((result: any) => {
          const state = getState();
          console.log('report subscription result ', {
            reports: state.reports,
            result,
          });
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
      console.log('Report Form values', values);
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
            const response = updateForm
              ? data.updateReport
              : data.createReport;
            patchState({ formSubmitting: false });
            console.log('update report ', { response });
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
            console.log('From createUpdateReport', { response });
          },
          (error) => {
            console.log('Some error happened ', error);
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
          console.log('from delete report ', { data });
          if (response.ok) {
            this.router.navigateByUrl(ReportFormCloseURL);
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'Report deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchReportsAction({
                searchParams: defaultSearchParams,
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

  @Action(ResetReportFormAction)
  resetReportForm({ patchState }: StateContext<ReportStateModel>) {
    patchState({
      reportFormRecord: emptyReportFormRecord,
      formSubmitting: false,
    });
  }
}
