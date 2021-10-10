import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { Institution } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchNextPublicInstitutionsAction,
  FetchPublicInstitutionssAction,
  ResetPublicHomePageListsAction,
} from '../../../state/public/public.actions';
import { PublicState } from '../../../state/public/public.state';

@Component({
  selector: 'app-institutions-feed',
  templateUrl: './institutions-feed.component.html',
  styleUrls: ['./institutions-feed.component.scss'],
})
export class InstitutionsFeedComponent {
  @Select(PublicState.listInstitutions)
  institutions$: Observable<Institution[]>;
  institutions: any[] = [];
  @Select(PublicState.isFetchingInstitutions)
  isFetchingInstitutions$: Observable<boolean>;
  isFetchingInstitutions: boolean;
  constructor(
    private store: Store,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.fetchInstitutions();
    this.institutions$.subscribe((val) => {
      this.institutions = val;
    });
  }

  generateInstitutionSubtitle(institution) {
    return `${institution.location}, ${institution.city}`;
  }

  fetchInstitutions() {
    this.store.dispatch(
      new FetchPublicInstitutionssAction({
        searchParams: {
          ...defaultSearchParams,
          pageSize: 10,
          columnFilters: {},
        },
      })
    );
  }

  onInstitutionScroll() {
    this.store.dispatch(new FetchNextPublicInstitutionsAction());
  }

  onClickInstitutionCard(institution) {
    this.router.navigateByUrl(
      `${uiroutes.INSTITUTION_PROFILE_ROUTE.route}/${institution.code}`
    );
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetPublicHomePageListsAction());
  }
}
