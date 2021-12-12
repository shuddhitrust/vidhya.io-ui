import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  Institution,
  IssueResourceTypeOptions,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { PublicState } from '../../../state/public/public.state';
import { GetPublicInstitutionAction } from '../../../state/public/public.actions';
import { uiroutes } from 'src/app/shared/common/ui-routes';

@Component({
  selector: 'app-institution-profile',
  templateUrl: './public-institution-profile.component.html',
  styleUrls: [
    './public-institution-profile.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class InstitutionProfileComponent implements OnInit {
  url: string;
  code: string;
  institutionDoesNotExist: boolean;
  resource = resources.INSTITUTION;
  resourceActions = RESOURCE_ACTIONS;
  params: object = {};
  @Select(PublicState.getInstitutionFormRecord)
  institutionFormRecord$: Observable<Institution>;
  institution: Institution;

  @Select(PublicState.isFetchingFormRecord)
  isFetchingFormRecord$: Observable<boolean>;

  constructor(
    private location: Location,
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.institutionFormRecord$.subscribe((val) => {
      this.institution = val;
    });
  }

  generateInstitutionLocation() {
    return `${this.institution.location}${
      this.institution.city ? ', ' + this.institution.city : ''
    }`;
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      institutionId: this.institution.id,
    });
  }

  goBack() {
    this.location.back();
  }

  reportInstitution() {
    this.router.navigate([uiroutes.ISSUE_FORM_ROUTE.route], {
      queryParams: {
        resourceType: IssueResourceTypeOptions.institution,
        resourceId: this.institution.code,
        link: window.location.href,
      },
    });
  }

  ngOnInit(): void {
    this.url = window.location.href;
    if (this.router.url.includes(uiroutes.INSTITUTION_PROFILE_ROUTE.route)) {
      this.code = this.url.split(
        uiroutes.INSTITUTION_PROFILE_ROUTE.route + '/'
      )[1];
      if (this.code && this.code != 'undefined' && this.code != 'null') {
        this.store.dispatch(
          new GetPublicInstitutionAction({ code: this.code })
        );
      } else {
        this.institutionDoesNotExist = true;
      }
    }
  }
}
