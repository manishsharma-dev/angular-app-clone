import { Directive, ElementRef, Input, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { getDecryptedData, getSessionData } from '../../shareService/storageData';

@Directive({
  selector: '[appPermission]'
})
export class PermissionDirective implements OnInit {
  @Input('permissionType') permissionType: string;
  constructor(private el: ElementRef, private render: Renderer2) { }

  ngOnInit(): void {
    //const getUserDetails = JSON.parse(sessionStorage.getItem('user'))?.additionalRoleAccess;
    const currentSection = getSessionData('subModuleCd');
    const currentModules = getSessionData('moduleList');
    const selectedModule = currentModules.find((module) => module.moduleCd == currentSection.moduleCd);
    if (selectedModule) var currentSubModule = selectedModule.subModules.find((subModule) => subModule.subModuleCd == currentSection.subModuleCd);
    if (!currentSubModule) {
      this.render.removeChild(this.el.nativeElement, this.el.nativeElement);
    }
    else {
      if (!currentSubModule[this.permissionType]) {
        this.render.removeChild(this.el.nativeElement, this.el.nativeElement);
      }
    }
  }



}
