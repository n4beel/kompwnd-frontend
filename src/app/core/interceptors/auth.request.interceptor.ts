import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Globals } from "../globals";

@Injectable()
export class AuthRequestInterceptor implements HttpInterceptor {
    constructor(private globals: Globals) {}
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authorizeRequest = request.clone(
        {headers: request.headers.set('Authorization', 'bearer ' + this.globals.accessToken)
     });
    return next.handle(authorizeRequest);
    }
}