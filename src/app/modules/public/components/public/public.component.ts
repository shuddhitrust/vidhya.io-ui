import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { uiroutes } from 'src/app/shared/common/ui-routes';

@Component({
  selector: 'app-public-component',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss'],
})
export class PublicComponent {
  title = 'vidhya-ui';
  uiroutes = uiroutes;
  @Input() firstTimeSetup;
  constructor(private router: Router, private readonly location: Location) {}

  currentRoute(): string {
    return this.location.path().substring(1);
  }
  currentRouteNoteEquals(routes: string[]): boolean {
    let result = true;
    routes.forEach((r) => {
      result = result && !this.currentRoute().toString().includes(r);
    });
    return result;
  }

  showHomePage() {
    // Make sure to add the routes of other components that are allowed to be shown when not logged in fully
    const routes = [
      uiroutes.PRIVACY_ROUTE.route,
      uiroutes.MEMBER_FORM_ROUTE.route,
      uiroutes.PASSWORD_RESET_ROUTE.route,
      uiroutes.MEMBER_PROFILE_ROUTE.route,
    ];
    return this.currentRouteNoteEquals(routes);
  }

  /**
   * This method ensures that we get to show select components to the user when not logged in
   * @param route
   * @returns
   */
  showUnprotectedPage(route) {
    switch (route) {
      case uiroutes.PASSWORD_RESET_ROUTE.route:
        if (this.router.url.startsWith(uiroutes.PASSWORD_RESET_ROUTE.route)) {
          return true;
        }
        break;
      case uiroutes.MEMBER_PROFILE_ROUTE.route:
        if (this.router.url.startsWith(uiroutes.MEMBER_PROFILE_ROUTE.route)) {
          return true;
        }
        break;
      case uiroutes.PRIVACY_ROUTE.route:
        if (this.router.url.startsWith(uiroutes.PRIVACY_ROUTE.route)) {
          return true;
        }
        break;
      case uiroutes.MEMBER_FORM_ROUTE.route:
        if (
          this.firstTimeSetup &&
          this.currentRoute() == uiroutes.MEMBER_FORM_ROUTE.route
        ) {
          return true;
        }
        break;
      case uiroutes.HOME_ROUTE.route:
        if (this.currentRoute() == uiroutes.HOME_ROUTE.route) {
          return true;
        }
        break;
      default:
        this.router.navigate[uiroutes.ERROR_ROUTE.route];
    }
    return false;
  }
}
