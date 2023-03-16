import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class TeamViewerService {
  constructor(private httpClient: HttpClient) {}

  getReports(formValue) {
    let url = `${environment.endpoint}/team/${formValue.reportType}?account_name=${formValue.username}`;
    if (formValue.dateRange && formValue.dateRange.length > 0) {
      const start_date = new Date(formValue.dateRange[0]).getTime();
      const end_date = new Date(formValue.dateRange[1]).getTime() + 86399000;
      url = `${environment.endpoint}/team/${formValue.reportType}?account_name=${formValue.username}&start_date=${start_date}&end_date=${end_date}`;
    }

    return new Promise((resolve, reject) => {
      this.httpClient
        .get(url)
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((response) => {
          reject(response);
        });
    });
  }

  getTeams(formValue) {
    let url = `${environment.endpoint}/team?account_name=${formValue.username}&offset=0&limit=${formValue.limit}`;
    if (formValue.dateRange && formValue.dateRange.length > 0) {
      const start_date = new Date(formValue.dateRange[0]).getTime();
      const end_date = new Date(formValue.dateRange[1]).getTime() + 86399000;
      url = `${environment.endpoint}/team?account_name=${formValue.username}&start_date=${start_date}&end_date=${end_date}&offset=0&limit=${formValue.limit}`;
    }
    return new Promise((resolve, reject) => {
      this.httpClient
        .get(url)
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((response) => {
          reject(response);
        });
    });
  }
}
