import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { getSessionData } from '../../shareService/storageData';

@Directive({
  selector: '[appRoutePermission]'
})
export class RoutePermissionDirective implements OnInit {
  @Input('routeInfo') routeInfo: string;
  @Input('permissionType') permissionType: string;
  constructor(private el: ElementRef, private render: Renderer2) { }
  ngOnInit(): void {
    const currentModules = getSessionData('moduleList');
    // for (let modules of currentModules) {
    //   if (modules['subModules'] && modules['subModules'].length) {
    //     for (module of modules['subModules']) {

    //     }
    //   }
    // }
    if(this.permissionType) {
      isPresent = currentModules.find(c => c.subModules.some(r => r.subModuleUrl == this.routeInfo && r.isActive && r[this.permissionType]));
    } else {
      var isPresent = currentModules.find(c => c.subModules.some(r => r.subModuleUrl == this.routeInfo && r.isActive && r.isAdd));
    }
    if (!isPresent) {
      this.render.removeChild(this.el.nativeElement, this.el.nativeElement);
    }
  }

}
