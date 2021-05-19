import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

const components = [
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatDialogModule,
  MatSnackBarModule,
  MatTabsModule,
  MatSidenavModule,
  MatListModule,
  MatInputModule,
  MatCardModule,
  MatProgressSpinnerModule,
  MatSelectModule,
];

@NgModule({
  imports: components,
  exports: components,
})
export class Styling {}
