import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { uiroutes } from 'src/app/shared/common/ui-routes';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: [
    './terms-conditions.component.scss',
    './../../../../../../../src/app/shared/common/shared-styles.css',
  ],
})
export class TermsConditionsComponent implements OnInit {
  privacyRoute: string = uiroutes.PRIVACY_ROUTE.route;
  constructor(private location: Location) {}
  ngOnInit() {}
  goBack() {
    this.location.back();
  }
}
