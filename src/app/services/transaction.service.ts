import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Globals } from '../core/globals';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    api: string = environment.endpoint
    httpOpts: any;

    constructor(public globals: Globals, private http: HttpClient) {
        if (this.globals.userName) {
            this.initialize()
        }
    }

    initialize() {
        this.httpOpts = {
            headers: new HttpHeaders({
                'X-Auth-Token': this.globals.userName,
                'Mainnet': this.globals.userName ? 'true' : 'false'
            })
        }
    }

    rewardDetail(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            }).catch((response) => {
                reject(response)
            })
        })
    }

    withdraw(endpoint: string, data = {}) {
        return new Promise((resolve, reject) => {
            this.http.post(this.api + endpoint, data, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            }).catch((response) => {
                reject(response)
            })
        })
    }

    roll(endpoint: string, data = {}) {
        return new Promise((resolve, reject) => {
            this.http.post(this.api + endpoint, data, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            }).catch((response) => {
                reject(response)
            })
        })
    }
}