import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoadingState } from '../../state/loading/loading.state';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
  @Select(LoadingState.getShowLoading)
  showLoading$: Observable<Boolean>;
  @Select(LoadingState.getLoadingMessage)
  loadingMessage$: Observable<String>;
  constructor() {}

  ngOnInit(): void {}
}
