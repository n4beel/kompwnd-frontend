import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-withdrawn-detail',
  templateUrl: './withdrawn-detail.component.html',
  styleUrls: ['./withdrawn-detail.component.scss']
})
export class WithdrawnDetailComponent implements OnInit {
  detailList = [];
  showLoader: boolean = false;
  responseRecieved: boolean = false;
  constructor(private dashboardService: DashboardService,private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getWithdrawalDetail();
  }

  getWithdrawalDetail() {
    // this.spinner.show();
    this.showLoader = true;
    this.dashboardService.matchBonusDetail('/dashboard/withdrawal').then((res: any) => {
      console.log(res)
      this.showLoader = false;
      this.responseRecieved = true;
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
