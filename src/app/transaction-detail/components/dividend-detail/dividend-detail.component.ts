import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dividend-detail',
  templateUrl: './dividend-detail.component.html',
  styleUrls: ['./dividend-detail.component.scss']
})
export class DividendDetailComponent implements OnInit {
  detailList = [];
  showLoader: boolean = false;
  responseRecieved: boolean = false;
  constructor(private dashboardService: DashboardService,private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getDividendDetail();
  }

  getDividendDetail() {
    // this.spinner.show();
    this.showLoader = true;
    this.dashboardService.dividendDetail('/dashboard/dividend').then((res: any) => {
      // this.spinner.show();
      this.responseRecieved = true;
      this.showLoader = false;
      console.log(res)
      if (res) {
        this.detailList = res.map((r) => {
          return {
            ...r,
            date: new Date (r.created_at)
          }
        })
      } 
    }).finally(() => {
      // this.spinner.hide();
      this.responseRecieved = true;
      this.showLoader = false;
    });
  }
}
