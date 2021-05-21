import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

const MODERATION = 'Moderation';
const INSTITUTIONS = 'Institutions';
const MEMBERS = 'Members';
const INSTITUTION_ADMINS = 'Institution Admins';
const CLASS_ADMINS = 'Class Admins';
const LEARNERS = 'Learners';

const entities = [
  MODERATION,
  INSTITUTIONS,
  MEMBERS,
  INSTITUTION_ADMINS,
  CLASS_ADMINS,
  LEARNERS,
];

const sectionParamKey = 'adminSection';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  @Input() params: object = {};
  opened: boolean = true;
  entities: string[] = entities;
  moderation: string = MODERATION;
  institutions: string = INSTITUTIONS;
  members: string = MEMBERS;
  institutionAdmins: string = INSTITUTION_ADMINS;
  classAdmins: string = CLASS_ADMINS;
  learners: string = LEARNERS;

  selectedEntity = this.entities[0];

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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