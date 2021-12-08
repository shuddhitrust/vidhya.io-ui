import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { resources } from 'src/app/shared/common/models';

const sectionParamKey = 'adminSection';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  @Input() params: object = {};
  opened: boolean = true;
  @Input() entities: any[] = [];
  issues: string = resources.ISSUE;
  moderation: string = resources.MODERATION;
  userRoles: string = resources.USER_ROLE;
  institutions: string = resources.INSTITUTION;
  members: string = resources.MEMBER;
  institutionAdmins: string = resources.INSTITUTION_ADMIN;
  classAdmins: string = resources.CLASS_ADMIN;
  learners: string = resources.LEARNER;
  selectedEntity;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.selectedEntity = this.entities[0]?.value;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const paramSection = params[sectionParamKey];
      if (paramSection) {
        this.selectedEntity = paramSection;
      } else {
        // If there are no tabname params, inject the available ones here.
        // Do this after authorization is implemented
      }
    });
  }
  ngOnChanges(changes) {
    if (changes.entities) {
      this.selectedEntity = this.selectedEntity
        ? this.selectedEntity
        : this.entities[0]?.value;
    }
  }

  onSelectEntity(entity) {
    this.selectedEntity = entity;
    this.onSelectionChange();
  }

  onSelectionChange() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [sectionParamKey]: this.selectedEntity },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
