import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate{

  constructor(private auth: AuthService, private router: Router){

  }

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean>{
    const isAuth = this.auth.isAuthenticated();
    if(! isAuth){
      this.router.navigate(['/login']);
    }else return true;
  }
}
