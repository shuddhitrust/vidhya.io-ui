import { Component, OnInit } from '@angular/core';
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
  selector: 'app-member-ship-state-pending',
  templateUrl: './member-ship-state-pending.component.html',
  styleUrls: ['./member-ship-state-pending.component.scss']
})
export class MemberShipStatePendingComponent implements OnInit {
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  messageDisplay: any = '';
  public ngDestroyed$ = new Subject();
  columnFilters = {
    roles: [USER_ROLES_NAMES.SUPER_ADMIN],
    institution_id: null
  };
  @Select(OptionsState.listInstitutionCoordinatorMembers)
  coordinatorsRecord$: Observable<User[]>;
  name: string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private store: Store) {

    this.currentMember$
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe((val) => {
        if (val?.membershipStatus == 'PE') {
          this.currentMember = val;
          console.log("currentMember",this.currentMember);
          this.name = this.currentMember?.firstName + " " + this.currentMember?.lastName;
          if (this.currentMember?.institution?.verified == false) {
            this.messageDisplay = "Your institution '"+this.currentMember?.institution?.name+"' is currently not verified. In order to fully use the application, you must ensure that your institution is verified.<br> Please request the administrators of your institution to reach out to '"+this.currentMember?.institution?.coordinator?.name+"' at <strong><a href='mailto:"+this.currentMember?.institution?.coordinator?.email+"' style='color: #0099ff;text-decoration: none;'>"+this.currentMember?.institution?.coordinator?.email+"</a></strong> or <strong>"+this.currentMember?.institution?.coordinator?.mobile+"</strong> and have your institution verified.";
          } else {
            this.messageDisplay = "Your account is currently not verified. <br>Please contact '" + this.currentMember?.institution?.coordinator?.name + "' at '" + this.currentMember.institution?.name + "' to complete your registration. You may reach them at <strong><a href='mailto:"+this.currentMember?.institution?.coordinator?.email+"' style='color: #0099ff;text-decoration: none;'>"+this.currentMember?.institution?.coordinator?.email+"</a></strong> or <strong>"+this.currentMember?.institution?.coordinator?.mobile+".</strong>";
          }
        }
      });
  }

  ngOnInit(): void {
    this.currentMember = history.state;
  }
}
