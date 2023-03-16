import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { Globals } from '../core/globals';

@Injectable({
    providedIn: 'root'
})
export class LandingPageService {
    api: string = environment.endpoint
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

    getData() {
        return new Promise((resolve, reject) => {
            this.http.get(this.api, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }
}