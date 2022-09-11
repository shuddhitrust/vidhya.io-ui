import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  CurrentMember,
  IssueResourceTypeOptions,
  Project,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { FetchMemberOptionsByInstitution } from 'src/app/shared/state/options/options.actions';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthState } from 'src/app/modules/auth/state/auth.state';

import { clipLongText, parseDateTime } from 'src/app/shared/common/functions';
import { ProjectState } from 'src/app/modules/dashboard/modules/project/state/project.state';
import {
  ClapProjectAction,
  DeleteProjectAction,
  GetProjectAction,
  ResetProjectFormAction,
} from 'src/app/modules/dashboard/modules/project/state/project.actions';
import { generateMemberProfileLink } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';
import { AuthStateModel } from 'src/app/modules/auth/state/auth.model';

@Component({
  selector: 'app-project-profile',
  templateUrl: './project-profile.component.html',
  styleUrls: [
    './project-profile.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class ProjectProfileComponent implements OnInit, OnDestroy {
  resource = resources.PROJECT;
  resourceActions = RESOURCE_ACTIONS;
  @Select(ProjectState.getProjectFormRecord)
  project$: Observable<Project>;
  project: Project;
  @Select(ProjectState.isFetching)
  isFetchingProject$: Observable<boolean>;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  projectDoesNotExist: boolean;
  memberRows: any[] = [];
  projectViewed: boolean = false;
  projectClapped: boolean = false;

  @Select(AuthState.projectsClapped)
  projectsClapped$: Observable<string[]>;
  projectsClapped: string[] = [];
  isLoggedIn: boolean = false;

  @Select(AuthState)
  authState$: Observable<AuthStateModel>;

  constructor(
    public dialog: MatDialog,
    private store: Store,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.project$.subscribe((val) => {
      this.project = val;
      if (!this.project.title) {
        this.projectDoesNotExist = true;
      } else {
        this.projectDoesNotExist = false;
      }
    });

    this.authState$.subscribe((state) => {
      this.projectsClapped = state.currentMember.projectsClapped;
      this.isLoggedIn = state.isLoggedIn;
    });
  }

  parseDate(date) {
    return parseDateTime(date);
  }

  clip(string) {
    return clipLongText(string, 100);
  }

  authorLink() {
    this.router.navigate([generateMemberProfileLink(this.project.author)]);
  }

  fetchMemberOptions() {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.store.dispatch(
      new FetchMemberOptionsByInstitution({
        memberInstitutionId: this.currentMember?.institution?.id,
      })
    );
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: [this.project?.author?.id],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const projectId = params['id'];
      if (projectId) {
        this.store.dispatch(
          new GetProjectAction({ id: projectId, fetchFormDetails: false })
        );
      }
    });
  }
  reportProject() {
    this.router.navigate([uiroutes.ISSUE_FORM_ROUTE.route], {
      queryParams: {
        resourceType: IssueResourceTypeOptions.user,
        resourceId: this.project.id,
        link: window.location.href,
      },
    });
  }

  goBack() {
    this.location.back();
  }

  editProject() {
    this.router.navigate([uiroutes.PROJECT_FORM_ROUTE.route], {
      queryParams: { id: this.project.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
  deleteConfirmation() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the project named "${this.project.title}"`,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteProject();
      }
    });
  }

  projectLinkClicked() {
    this.projectViewed = true;
  }

  clapProject() {
    if (this.projectViewed && !this.projectClapped) {
      this.store.dispatch(
        new ClapProjectAction({
          id: this.project.id,
          isLoggedIn: this.isLoggedIn,
        })
      );
      this.projectClapped = true;
    }
  }

  clapButtonClass(id) {
    return this.projectsClapped?.includes(id) || this.projectClapped
      ? 'project-clap-button-clapped'
      : 'project-clap-button-unclapped';
  }

  projectClapButtonTooltip(id): string {
    let tooltip = 'Please review the project before being able to applaud it';
    if (this.projectsClapped?.includes(id)) {
      tooltip = 'You have already applauded this project';
    } else if (this.projectViewed) {
      tooltip = 'Applaud this project';
    }
    return tooltip;
  }

  deleteProject() {
    this.store.dispatch(new DeleteProjectAction({ id: this.project.id }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetProjectFormAction());
  }
}
