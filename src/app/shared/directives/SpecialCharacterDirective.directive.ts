import { Directive, HostListener, ElementRef, Input } from '@angular/core';
@Directive({
  selector: '[specialIsAlphaNumeric]',
})
export class SpecialCharacterDirective {
  regexStr = '^[a-zA-Z0-9_.]*$';
  @Input() isAlphaNumeric: boolean;

  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    return new RegExp(this.regexStr).test(event.key);
  }

  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    this.validateFields(event);
  }

  validateFields(event) {
    console.log(event.target.value);
    setTimeout(() => {
      this.el.nativeElement.value = this.el.nativeElement.value
        .replace(/[^A-Za-z ]/g, '')
        .replace(/\s/g, '');
      event.preventDefault();
    }, 100);
  }

  ngAfterViewInit():boolean{
    if(this.el.nativeElement.value){
      if(new RegExp(this.regexStr).test(this.el.nativeElement.value)){
        return true;
      }
    }
    return false;
  }
}
