import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';
import { Globals } from '../core/globals';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    api: string = environment.endpoint
    httpOpts: any;

    public notification = new Subject<{title: string, body: string}>();


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

    getNotifications(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }
    
}