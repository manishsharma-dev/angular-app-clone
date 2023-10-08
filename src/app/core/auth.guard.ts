import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateChild
} from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../features/auth/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackBarMessage } from "../shared/snack-bar";



@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    const isAuth = this.authService.getIsAuth();
    if (!isAuth) {
      new SnackBarMessage(this._snackBar).onSucessMessage('You Are Not Authorized', 'Try again !', 'center', 'top', 'red-snackbar');
      this.router.navigate(['/auth/login']);
    }
    return isAuth;
  }
  canActivateChild(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return this.canActivate(route, state)
  }
}
