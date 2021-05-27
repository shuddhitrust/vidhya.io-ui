import {
  Component,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import { defaultPageSize } from '../../table.model';
import { pageSizeOptions } from './../../table.config';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnChanges {
  @Input() totalRecords = defaultPageSize;
  @Input() currentPage = 1;
  @Input() pageSize = defaultPageSize;
  @Input() rowsShowing = defaultPageSize;
  @Input() searchQuery: string;
  @Input() staticTable = false;
  searchInfoText = '';
  @Output() onPageChange: EventEmitter<any> = new EventEmitter();
  @Output() onPageSizeChange: EventEmitter<any> = new EventEmitter();
  pageSizeOptions: Array<any> = pageSizeOptions.map((p) => p.value);
  currentlyShowing: number;
  totalRecordsShowing: number;
  lastPage: number;
  showSearchTextInfo = () => {
    return typeof this.totalRecords === 'number' && this.currentlyShowing !== 0;
  };
  runOnPageChange(newPage: number): void {
    if (this.onPageChange) {
      this.onPageChange.emit(newPage);
    }
  }
  runOnPageSizeChange(newPageSize: number): void {
    this.onPageSizeChange.emit(newPageSize);
  }
  SetPaginationMeta = () => {
    // Calculating the last page from total records...
    this.totalRecordsShowing = this.totalRecords;
    this.lastPage = lastPageCalculator(this.totalRecords, this.pageSize);
    // Calculating the no. of records being shown on current page...
    if (this.staticTable) {
      this.currentlyShowing = this.totalRecords;
    } else if (this.totalRecords > this.pageSize) {
      this.currentlyShowing = this.rowsShowing;
      if (
        this.currentlyShowing < this.pageSize &&
        this.currentPage != this.lastPage
      ) {
        this.totalRecordsShowing = this.currentlyShowing;
      }
      // this.currentPage == this.lastPage
      //   ? this.totalRecords % this.pageSize
      //   : this.actualShowing;
    } else {
      this.currentlyShowing = this.totalRecords;
    }
    console.log('from setPaginationMet => ', {
      lastPage: this.lastPage,
      currentPage: this.currentPage,
      currentlyShowing: this.currentlyShowing,
    });
    const record = this.totalRecords > 1 ? 'records' : 'record';
    this.searchInfoText = `Showing ${this.currentlyShowing} of ${
      this.totalRecordsShowing
    } ${record}${this.searchQuery ? ` for "${this.searchQuery}"` : ''}`;
  };
  constructor() {}

  ngOnInit() {
    this.SetPaginationMeta();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Recalculating the pagination related info. on every change...
    this.SetPaginationMeta();
  }
}

/*
 * Function to calculate the last page...
 */
const lastPageCalculator = (totalRecords, pageSize) => {
  const lastPage = totalRecords / pageSize;
  if (totalRecords === 1) {
    return 1;
  } else {
    return Math.ceil(lastPage);
  }
};
