import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { Globals } from '../core/globals';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
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

    addBuddy(endpoint: string, data: any) {
        return new Promise((resolve, reject) => {
            this.http.post(this.api + endpoint, data, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            }).catch((response) => {
                reject(response)
            })
        })
    }

    getBuddy(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }

    getCurrencies(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.currencyApi + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }
}