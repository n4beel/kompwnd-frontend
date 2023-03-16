import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { Globals } from '../core/globals';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    api: string = environment.endpoint
    currencyApi = environment.currencyEndpoint
    httpOpts: any;

    constructor(public globals: Globals, private http: HttpClient) {
        if(this.globals.userName) {
            this.initialize()
        }
    }
    
    initialize() {
        this.httpOpts = {
            headers: new HttpHeaders({
                'X-Auth-Token': this.globals.userName,
                'Mainnet': this.globals.userName? 'true' : 'false'
            })
        }
    }

    detail(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }

    priceGraphDetail(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.currencyApi + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }

    depositDetail(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }

    matchBonusDetail(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }

    withdrawalDetail(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }

    dividendDetail(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }

    referralDetail(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }
}