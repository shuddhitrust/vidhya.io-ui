import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';
import { MemberState } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.state';
import { USER_ROLES_NAMES } from 'src/app/shared/common/constants';
import { CurrentMember, User } from 'src/app/shared/common/models';
import { AuthState } from '../../state/auth.state';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { FetchCoordinatorsByInstitution } from 'src/app/shared/state/options/options.actions';
import { OptionsState } from 'src/app/shared/state/options/options.state';

@Component({
  selector: 'app-member-ship-status',
  templateUrl: './member-ship-status.component.html',
  styleUrls: ['./member-ship-status.component.scss']
})
export class MemberShipStatusComponent implements OnInit, OnDestroy {
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  messageDisplay: any = '';
  destroy$: Subject<boolean> = new Subject<boolean>();
  columnFilters = {
    roles: [USER_ROLES_NAMES.SUPER_ADMIN],
    institution_id: null
  };
  @Select(OptionsState.listInstitutionCoordinatorMembers)
  coordinatorsRecord$: Observable<User[]>;
  name: string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private store: Store) {

    this.currentMember$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (val?.username) {
          this.currentMember = val;
          var str1= '';
          var str2 = '';
          this.name = this.currentMember?.firstName + " " + this.currentMember?.lastName;
          if (val?.membershipStatus == 'PE') {
            if (this.currentMember?.institution?.verified == false) {
              str1 =  "Your institution '" + this.currentMember?.institution?.name + "' is currently not verified. In order to fully use the application, you must ensure that your institution is verified.<br> Please request the administrators of your institution to reach out to '" + this.currentMember?.institution?.coordinator?.name + "' at <strong><a href='mailto:" + this.currentMember?.institution?.coordinator?.email + "' style='color: #0099ff;text-decoration: none;'>" + this.currentMember?.institution?.coordinator?.email + "</a></strong> ";
              str2 = this.currentMember?.institution?.coordinator?.mobile?" or <strong>" + this.currentMember?.institution?.coordinator?.mobile + "</strong>":""+" and have your institution verified.";
              
            } else {
              str1 = "Your account is currently not verified. <br>Please contact '" + this.currentMember?.institution?.coordinator?.name + "' at '" + this.currentMember.institution?.name + "' to complete your registration. You may reach them at <strong><a href='mailto:" + this.currentMember?.institution?.coordinator?.email + "' style='color: #0099ff;text-decoration: none;'>" + this.currentMember?.institution?.coordinator?.email + "</a></strong>";
              str2 = this.currentMember?.institution?.coordinator?.mobile?" or <strong>" + this.currentMember?.institution?.coordinator?.mobile + ".</strong>":".";
            }
          } else if (val?.membershipStatus == 'SU') {
            str1 = 'Your account is curently suspended. The following was added as the reason for suspension <br><strong>"' + this?.currentMember?.bio + '"</strong> <br>If you wish to reach out to someone to seek further information, please reach out to the coordinator of your institution, <strong>' + this.currentMember?.institution?.coordinator?.name + '</strong> at <strong>' + this.currentMember?.institution?.coordinator?.email + '</strong>';          
            str2 = this.currentMember?.institution?.coordinator?.mobile?" or <strong>" + this.currentMember?.institution?.coordinator?.mobile + ".</strong>":".";
          }
          this.messageDisplay = str1 + str2;

        }
      });
  }

  ngOnInit(): void {
    // this.currentMember = history.state;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
