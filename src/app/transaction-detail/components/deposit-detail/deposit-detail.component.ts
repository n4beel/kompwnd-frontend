import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-deposit-detail',
  templateUrl: './deposit-detail.component.html',
  styleUrls: ['./deposit-detail.component.scss']
})
export class DepositDetailComponent implements OnInit {
  detailList = [];
  showLoader: boolean = false;
  responseRecieved: boolean = false;
    
    constructor(private dashboardService: DashboardService,private spinner: NgxSpinnerService,) { }

  ngOnInit(): void {
    this.getDepositDetail();
  }

  getDepositDetail() {
    // this.spinner.show();
    this.showLoader = true;
    this.dashboardService.detail('/dashboard/deposit').then((res: any) => {
      // this.spinner.hide();
      this.responseRecieved = true;
      this.showLoader = false
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
      this.showLoader = false;
      this.responseRecieved = true;
    });
  }

}
