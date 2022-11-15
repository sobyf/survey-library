import { Directive, ElementRef, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef } from "@angular/core";
import { AngularComponentFactory } from "../component-factory";

interface IDynamicComponent {
  name: string;
  data?: any;
  default?: string;
}

@Directive({
  selector: "[surveyComponent]"
})

export class DynamicComponentDirective implements OnChanges {
  constructor(private containerRef: ViewContainerRef, private templateRef: TemplateRef<unknown>) { }
  @Input() surveyComponent!: IDynamicComponent;
  private componentInstance: any;
  ngOnChanges(changes: SimpleChanges): void {
    const componentChanges = changes["surveyComponent"];
    if(componentChanges.currentValue.name !== componentChanges.previousValue?.name ||
      (componentChanges.currentValue.name === undefined && componentChanges.previousValue === undefined && !this.componentInstance)) {
      this.createComponent();
    } else {
      this.updateComponentData();
    }
  }
  createComponent(): void {
    this.containerRef.clear();
    if(AngularComponentFactory.Instance.isComponentRegistered(this.surveyComponent.name)) {
      this.componentInstance = AngularComponentFactory.Instance.create(this.containerRef, this.surveyComponent.name).instance;
    } else if (this.surveyComponent.default) {
      this.componentInstance = AngularComponentFactory.Instance.create(this.containerRef, this.surveyComponent.default).instance;
    }
    if(!this.componentInstance) {
      throw new Error(`Can't create component with name: ${this.surveyComponent.name} and default: ${this.surveyComponent.default}`);
    } else {
      this.componentInstance.contentTempl = this.templateRef;
    }
    this.updateComponentData();
  }
  updateComponentData(): void {
    const data = this.surveyComponent.data;
    Object.keys(data).forEach((key) => {
      this.componentInstance[key] = data[key];
    });
  }
}