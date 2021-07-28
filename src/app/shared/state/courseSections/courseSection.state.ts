import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import {
  defaultCourseSectionState,
  emptyCourseSectionFormRecord,
  CourseSectionFormCloseURL,
  CourseSectionStateModel,
} from './courseSection.model';

import { Injectable } from '@angular/core';
import {
  CourseSectionSubscriptionAction,
  CreateUpdateCourseSectionAction,
  DeleteCourseSectionAction,
  FetchCourseSectionsAction,
  FetchNextCourseSectionsAction,
  ForceRefetchCourseSectionsAction,
  GetCourseSectionAction,
  ResetCourseSectionFormAction,
} from './courseSection.actions';
import { COURSE_SECTION_QUERIES } from '../../api/graphql/queries.graphql';
import { Apollo } from 'apollo-angular';
import { CourseSection, MatSelectOption, FetchParams } from '../../common/models';
import { COURSE_SECTION_MUTATIONS } from '../../api/graphql/mutations.graphql';
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

@State<CourseSectionStateModel>({
  name: 'courseSectionState',
  defaults: defaultCourseSectionState,
})
@Injectable()
export class CourseSectionState {
  constructor(
    private apollo: Apollo,
    private store: Store,
    private router: Router
  ) {}

  @Selector()
  static listCourseSections(state: CourseSectionStateModel): CourseSection[] {
    return state.courseSections;
  }

  @Selector()
  static isFetching(state: CourseSectionStateModel): boolean {
    return state.isFetching;
  }

  @Selector()
  static fetchParams(state: CourseSectionStateModel): FetchParams {
    return state.fetchParamObjects[state.fetchParamObjects.length - 1];
  }
  @Selector()
  static listCourseSectionOptions(state: CourseSectionStateModel): MatSelectOption[] {
    const options: MatSelectOption[] = state.courseSections.map((i) => {
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
  static errorFetching(state: CourseSectionStateModel): boolean {
    return state.errorFetching;
  }

  @Selector()
  static formSubmitting(state: CourseSectionStateModel): boolean {
    return state.formSubmitting;
  }

  @Selector()
  static errorSubmitting(state: CourseSectionStateModel): boolean {
    return state.errorSubmitting;
  }

  @Selector()
  static getCourseSectionFormRecord(state: CourseSectionStateModel): CourseSection {
    return state.courseSectionFormRecord;
  }

  @Action(ForceRefetchCourseSectionsAction)
  forceRefetchCourseSections({ patchState }: StateContext<CourseSectionStateModel>) {
    patchState({ fetchPolicy: 'network-only' });
    this.store.dispatch(
      new FetchCourseSectionsAction({ searchParams: defaultSearchParams })
    );
  }

  @Action(FetchNextCourseSectionsAction)
  fetchNextCourseSections({ getState }: StateContext<CourseSectionStateModel>) {
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
        new FetchCourseSectionsAction({ searchParams: newSearchParams })
      );
    }
  }
  @Action(FetchCourseSectionsAction)
  fetchCourseSections(
    { getState, patchState }: StateContext<CourseSectionStateModel>,
    { payload }: FetchCourseSectionsAction
  ) {
    console.log('Fetching courseSections from courseSection state');
    let { searchParams } = payload;
    const state = getState();
    const { fetchPolicy, fetchParamObjects, courseSectionsSubscribed } = state;
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
      console.log('variables for courseSections fetch ', { variables });
      this.apollo
        .watchQuery({
          query: COURSE_SECTION_QUERIES.GET_COURSE_SECTIONS,
          variables,
          fetchPolicy,
        })
        .valueChanges.subscribe(
          ({ data }: any) => {
            console.log('resposne to get courseSections query ', { data });
            const response = data.courseSections;
            const totalCount = response[0]?.totalCount
              ? response[0]?.totalCount
              : 0;
            newFetchParams = { ...newFetchParams, totalCount };
            console.log('from after getting courseSections', {
              totalCount,
              response,
              newFetchParams,
            });
            patchState({
              courseSections: response,
              fetchParamObjects: state.fetchParamObjects.concat([
                newFetchParams,
              ]),
              isFetching: false,
            });
            if (!courseSectionsSubscribed) {
              this.store.dispatch(new CourseSectionSubscriptionAction());
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

  @Action(CourseSectionSubscriptionAction)
  subscribeToCourseSections({ getState, patchState }: StateContext<CourseSectionStateModel>) {
    const state = getState();
    if (!state.courseSectionsSubscribed) {
      this.apollo
        .subscribe({
          query: SUBSCRIPTIONS.courseSection,
        })
        .subscribe((result: any) => {
          const state = getState();
          console.log('courseSection subscription result ', {
            courseSections: state.courseSections,
            result,
          });
          const method = result?.data?.notifyCourseSection?.method;
          const courseSection = result?.data?.notifyCourseSection?.courseSection;
          const { items, fetchParamObjects } = subscriptionUpdater({
            items: state.courseSections,
            method,
            subscriptionItem: courseSection,
            fetchParamObjects: state.fetchParamObjects,
          });
          patchState({
            courseSections: items,
            fetchParamObjects,
            courseSectionsSubscribed: true,
          });
        });
    }
  }

  @Action(GetCourseSectionAction)
  getCourseSection(
    { patchState }: StateContext<CourseSectionStateModel>,
    { payload }: GetCourseSectionAction
  ) {
    const { id } = payload;
    patchState({ isFetching: true });
    this.apollo
      .watchQuery({
        query: COURSE_SECTION_QUERIES.GET_COURSE_SECTION,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.subscribe(
        ({ data }: any) => {
          const response = data.courseSection;
          patchState({ courseSectionFormRecord: response, isFetching: false });
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

  @Action(CreateUpdateCourseSectionAction)
  createUpdateCourseSection(
    { getState, patchState }: StateContext<CourseSectionStateModel>,
    { payload }: CreateUpdateCourseSectionAction
  ) {
    const state = getState();
    const { form, formDirective } = payload;
    let { formSubmitting } = state;
    if (form.valid) {
      formSubmitting = true;
      patchState({ formSubmitting });
      const values = form.value;
      console.log('CourseSection Form values', values);
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
            ? COURSE_SECTION_MUTATIONS.UPDATE_COURSE_SECTION
            : COURSE_SECTION_MUTATIONS.CREATE_COURSE_SECTION,
          variables,
        })
        .subscribe(
          ({ data }: any) => {
            const response = updateForm ? data.updateCourseSection : data.createCourseSection;
            patchState({ formSubmitting: false });
            console.log('update courseSection ', { response });
            if (response.ok) {
              this.store.dispatch(
                new ShowNotificationAction({
                  message: `CourseSection ${
                    updateForm ? 'updated' : 'created'
                  } successfully!`,
                  action: 'success',
                })
              );
              form.reset();
              formDirective.resetForm();
              this.router.navigateByUrl(CourseSectionFormCloseURL);
              patchState({
                courseSectionFormRecord: emptyCourseSectionFormRecord,
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
            console.log('From createUpdateCourseSection', { response });
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

  @Action(DeleteCourseSectionAction)
  deleteCourseSection(
    {}: StateContext<CourseSectionStateModel>,
    { payload }: DeleteCourseSectionAction
  ) {
    let { id } = payload;
    this.apollo
      .mutate({
        mutation: COURSE_SECTION_MUTATIONS.DELETE_COURSE_SECTION,
        variables: { id },
      })
      .subscribe(
        ({ data }: any) => {
          const response = data.deleteCourseSection;
          console.log('from delete courseSection ', { data });
          if (response.ok) {
            this.router.navigateByUrl(CourseSectionFormCloseURL);
            this.store.dispatch(
              new ShowNotificationAction({
                message: 'CourseSection deleted successfully!',
                action: 'success',
              })
            );
            this.store.dispatch(
              new ForceRefetchCourseSectionsAction({
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

  @Action(ResetCourseSectionFormAction)
  resetCourseSectionForm({ patchState }: StateContext<CourseSectionStateModel>) {
    patchState({
      courseSectionFormRecord: emptyCourseSectionFormRecord,
      formSubmitting: false,
    });
  }
}
