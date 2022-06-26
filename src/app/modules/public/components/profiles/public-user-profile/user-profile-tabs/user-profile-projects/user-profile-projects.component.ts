import { Component, Input, OnChanges } from '@angular/core';
import { User } from 'src/app/shared/common/models';
import { emptyMemberFormRecord } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';

@Component({
  selector: 'app-user-projects',
  templateUrl: './user-profile-projects.component.html',
  styleUrls: [
    './user-profile-projects.component.scss',
    './../../../../../../../shared/common/shared-styles.css',
  ],
})
export class UserProjectsComponent implements OnChanges {
  @Input() member: User = emptyMemberFormRecord;
  @Input() ownProfile: boolean = false;
  constructor() {}

  ngOnChanges(changes) {
    if (changes.member) {
      this.member = changes.member.currentValue;
    }
  }
}
