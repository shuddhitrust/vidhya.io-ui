import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-simple-loading-spinner',
  templateUrl: './simple-loading-spinner.html',
  styleUrls: ['./simple-loading-spinner.scss'],
})
export class SimpleLoadingSpinnerComponent implements OnInit {
  @Input()
  loadingMessage = 'Loading...';

  constructor() {}

  ngOnInit(): void {}
}
