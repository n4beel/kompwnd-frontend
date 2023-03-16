import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-referral-detail',
  templateUrl: './referral-detail.component.html',
  styleUrls: ['./referral-detail.component.scss']
})
export class ReferralDetailComponent implements OnInit {
  detailList = [];
  showLoader: boolean = false;
  responseRecieved: boolean = false;
  constructor(
    private dashboardService: DashboardService,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getReferralDetail();
  }

  getReferralDetail() {
    // this.spinner.show();
    this.showLoader = true;
    this.dashboardService.referralDetail('/dashboard/referral').then((res: any) => {
      // this.spinner.hide();
    this.showLoader = false;
    this.responseRecieved = true;

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
