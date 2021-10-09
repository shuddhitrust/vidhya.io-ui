import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { uiroutes } from '../../../../../shared/common/ui-routes';

@Component({
  selector: 'app-error-component',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorPageComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit() {}
  goHome() {
    this.router.navigateByUrl(uiroutes.HOME_ROUTE.route);
  }
}
