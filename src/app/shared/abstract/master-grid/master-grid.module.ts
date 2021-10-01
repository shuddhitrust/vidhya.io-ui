import { NgModule } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';

import { MasterGridComponent } from 'src/app/shared/abstract/master-grid/components/master-grid/master-grid.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
@NgModule({
  declarations: [MasterGridComponent, PaginatorComponent],
  exports: [MasterGridComponent, PaginatorComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule.withComponents([]),
    NzPaginationModule,
    MatIconModule,
    MatFormFieldModule,
  ],
})
export class MasterGridModule {}
