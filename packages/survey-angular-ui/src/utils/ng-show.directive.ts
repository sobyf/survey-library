import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from "@angular/core";

@Directive({
  selector: "[surveyVisible]"
})
export class VisibleDirective implements OnChanges {
  constructor(private el: ElementRef) { }
  @Input() surveyVisible?: boolean;
  ngOnChanges(changes: SimpleChanges): void {
    changes["surveyVisible"].currentValue ? this.show() : this.hide();
  }
  private hide() {
    this.el.nativeElement.style.display = "none";
  }
  private show() {
    this.el.nativeElement.style.display = "";
  }
}