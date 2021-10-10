import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: [
    './privacy.component.scss',
    './../../../../../../../src/app/shared/common/shared-styles.css',
  ],
})
export class PrivacyComponent implements OnInit {
  constructor(private location: Location) {}
  ngOnInit() {}
  goBack() {
    this.location.back();
  }
}
