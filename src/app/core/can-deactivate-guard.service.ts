import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanDeactivate
} from "@angular/router";

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";


export interface canComponentDeactivate{
  canDeactivate:()=> boolean | Observable<boolean> | Promise<boolean> 
}


@Injectable({ providedIn: "root" })
export class canDeactivateGuard implements CanDeactivate<canComponentDeactivate> {
  
  canDeactivate(component:canComponentDeactivate,
    currentRoute:ActivatedRouteSnapshot,currentState:RouterStateSnapshot, next?:RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return component.canDeactivate();
  }
  
}