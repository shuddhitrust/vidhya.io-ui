import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'infinite-scroll',
  template: `<div #anchor></div>
    <ng-content></ng-content> `,
})
export class InfiniteScrollComponent implements AfterViewInit, OnDestroy {
  @Input() options = {};
  @Output() scrolled = new EventEmitter();
  @ViewChild('anchor', { static: false }) anchor: ElementRef<HTMLElement>;

  private observer: IntersectionObserver;

  constructor(private host: ElementRef) {}

  get element() {
    console.log('this.host', this.host);
    return this.host.nativeElement;
  }
  ngAfterViewInit() {
    const options = {
      root: this.isHostScrollable() ? this.host.nativeElement : null,
      ...this.options,
    };

    this.observer = new IntersectionObserver(([entry]) => {
      entry.isIntersecting && this.scrolled.emit('');
    }, options);
    console.log('this.anchor', this.anchor);
    this.observer.observe(this.anchor.nativeElement);
  }
  private isHostScrollable() {
    const style = window.getComputedStyle(this.element);

    return (
      style.getPropertyValue('overflow') === 'auto' ||
      style.getPropertyValue('overflow-y') === 'scroll'
    );
  }
  ngOnDestroy() {
    this.observer.disconnect();
  }
}
