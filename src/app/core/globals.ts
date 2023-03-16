import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class Globals {
    isAuthenticated = false;
    accessToken = '';
    userName = '';
    fcmToken = '';
    constructor(public auth: AuthService, private http: HttpClient) { }
    

    setToken(token) {
        this.isAuthenticated = true;
        this.accessToken = token
        localStorage.setItem('token', token)
    }

    setUserName(name) {
        this.userName = name;
        localStorage.setItem('userName', name)
    }

    async setReferral(referral) {
        const isUser = await this.auth.isAccount(referral)
        if (isUser) {
            localStorage.setItem('referral', referral)
        }
    }

    flush() {
        this.isAuthenticated = false;
        this.accessToken = null
        this.userName = null;
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        localStorage.removeItem('referral')
        localStorage.removeItem('kompwnd-user')
    }
    
}