import { Input, Directive, ViewContainerRef, TemplateRef } from '@angular/core';
import { AuthService } from 'src/app/features/auth/auth.service';

@Directive({
  selector: '[hasRoles]',
})
export class HasRoleDirective {
  roles=[];
  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private auth: AuthService
  ) {}

  @Input() set hasRoles(reqRoles: string[]) {
    let defaultRole=JSON.parse(sessionStorage.getItem('user')).defaultRoleAccess;
    for(let data of defaultRole['modules']){
      if(data){
        this.roles.push(data.moduleDesc)
      }
      
    }
    if (this.checkRoles(this.roles, reqRoles)) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  
  }

  checkRoles(userRoles: any, reqRoles: any[]) {
    return null;
  }
}
