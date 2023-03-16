import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Globals } from '../globals';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private globals: Globals, private router: Router) { };
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {
        if (localStorage.getItem('token')) {
            this.globals.setToken(localStorage.getItem('token'))
        }
        if (localStorage.getItem('userName')) {
            this.globals.setUserName(localStorage.getItem('userName'))
        }
        const referral = next.queryParams['referral']
        if (referral) {
            this.globals.setReferral(referral)
        }
        let isLoggedIn = this.globals.accessToken ? true : false;
        if (isLoggedIn) {
            return true
        } else {
            this.router.navigate(['']);
        }
    }

}
