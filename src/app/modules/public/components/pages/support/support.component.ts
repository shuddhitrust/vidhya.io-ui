import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CurrentMember } from 'src/app/shared/common/models';
import { AuthState } from '../app/shared/state/auth/auth.state';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit, OnDestroy {
  supportEmail: string = ''; // environment.support_email;
  username: string = '';
  institution: string = '';
  role: string = '';
  name: string = '';
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.currentMember$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.currentMember = val;
      this.username = this.currentMember.username;
      this.institution = this.currentMember?.institution?.name;
      this.role = this.currentMember?.role?.name;
      this.name = this.currentMember?.name;
    });
  }

  constructMailToLink() {
    return `mailto:${this.supportEmail}?subject=${this.username}%20from%20${this.institution}%20needs%20support%20with%20something&body=Your%20message%3A%0D%0A---%0D%0A%0D%0A---%0D%0ADo%20not%20modify%20any%20information%20below%0D%0A%0D%0AName%3A%20${this.name}%0D%0APhone%3A%20%0D%0ARole%3A%20${this.role}%0D%0AInstitution%3A%20${this.institution}%0D%0A%0D%0A%0D%0A`;
  }
  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
