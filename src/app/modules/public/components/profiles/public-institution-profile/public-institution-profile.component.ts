import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  Institution,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { PublicState } from '../../../state/public/public.state';
import { GetPublicInstitutionAction } from '../../../state/public/public.actions';

@Component({
  selector: 'app-institution-profile',
  templateUrl: './public-institution-profile.component.html',
  styleUrls: [
    './public-institution-profile.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class InstitutionProfileComponent implements OnInit {
  resource = resources.INSTITUTION;
  resourceActions = RESOURCE_ACTIONS;
  params: object = {};
  @Select(PublicState.getInstitutionFormRecord)
  institutionFormRecord$: Observable<Institution>;
  institution: any;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetPublicInstitutionAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
