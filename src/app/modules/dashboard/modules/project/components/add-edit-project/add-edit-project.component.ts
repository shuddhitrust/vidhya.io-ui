import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CurrentMember, Project } from 'src/app/shared/common/models';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { ProjectState } from '../../state/project.state';
import { emptyProjectFormRecord } from '../../state/project.model';
import {
  CreateUpdateProjectAction,
  GetProjectAction,
} from '../../state/project.actions';

@Component({
  selector: 'app-add-edit-project',
  templateUrl: './add-edit-project.component.html',
  styleUrls: [
    './add-edit-project.component.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
})
export class AddEditProjectComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {};
  @Select(ProjectState.getProjectFormRecord)
  projectFormRecord$: Observable<Project>;
  @Select(ProjectState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  projectFormRecord: Project = emptyProjectFormRecord;
  projectForm: FormGroup;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });

    this.projectForm = this.setupProjectFormProject();
    this.projectFormRecord$.subscribe((val) => {
      this.projectFormRecord = val;
      this.projectForm = this.setupProjectFormProject(this.projectFormRecord);
    });
  }

  setupProjectFormProject = (
    projectFormRecord: Project = emptyProjectFormRecord
  ): FormGroup => {
    const formProject = this.fb.group({
      id: [projectFormRecord?.id],
      title: [projectFormRecord?.title, Validators.required],
      description: [projectFormRecord?.description, Validators.required],
    });

    return formProject;
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetProjectAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(new CreateUpdateProjectAction({ form, formDirective }));
  }
}
