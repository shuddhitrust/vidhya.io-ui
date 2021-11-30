import { Component, Input, OnChanges } from '@angular/core';
import { User } from 'src/app/shared/common/models';
import { parseDateTime } from 'src/app/shared/common/functions';
import { emptyMemberFormRecord } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';

@Component({
  selector: 'app-user-courses',
  templateUrl: './user-profile-courses.component.html',
  styleUrls: [
    './user-profile-courses.component.scss',
    './../../../../../../../shared/common/shared-styles.css',
  ],
})
export class UserCoursesComponent implements OnChanges {
  @Input() member: User = emptyMemberFormRecord;
  courses: any = [];
  @Input() ownProfile: boolean = false;
  constructor() {
    this.courses = this.member?.courses;
  }

  ngOnChanges(changes) {
    if (changes.member) {
      this.courses = this.member?.courses;
    }
  }

  parseDate(date) {
    return parseDateTime(date);
  }
}
