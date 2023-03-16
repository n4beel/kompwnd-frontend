import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  constructor(
    private httpClient: HttpClient
  ) { }

  protected httpGet(path: string) {
    return this.httpClient.get(path, { headers: this.getHeaders() });
  }

  protected httpPost(path: string, params?, httpOptions? ) {
    params = params || {};
    return this.httpClient.post(path, params, httpOptions ? httpOptions : { headers: this.getHeaders() });
  }

  public buildQuery(params: any): string {
    let query: string = '';
    let connector: string;
    for (let param in params) {
      connector = query ? '&' : '?';
      query = params[param] ? query + connector + param + '=' + params[param] : query;
    }
    return query;
  }

  private getHeaders() {
    var headers = new HttpHeaders();
    return headers;
  }

}
