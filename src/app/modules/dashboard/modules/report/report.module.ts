import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
// import { MasterGridModule } from 'src/app/shared/modules/master-grid/master-grid.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ReportDashboardComponent } from './components/report-dashboard/report-dashboard.component';
import { ReportsTableComponent } from './components/reports-table/reports-table.component';
import { ReportState } from './state/report.state';

const declarations = [ReportsTableComponent, ReportDashboardComponent];
const imports = [SharedModule, /*MasterGridModule*/];

@NgModule({
  declarations,
  imports: [...imports, NgxsModule.forFeature([ReportState])],
  exports: [...declarations, ...imports],
})
export class ReportModule {}
