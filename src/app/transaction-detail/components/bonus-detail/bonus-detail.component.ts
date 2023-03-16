import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-bonus-detail',
  templateUrl: './bonus-detail.component.html',
  styleUrls: ['./bonus-detail.component.scss']
})
export class BonusDetailComponent implements OnInit {
  detailList = [];
  showLoader: boolean = false;
  responseRecieved: boolean = false;
  constructor(
    private dashboardService: DashboardService,
    private spinner: NgxSpinnerService,
    ) { }

  ngOnInit(): void {
    this.getBonusDetail();
  }

  getBonusDetail() {
    // this.spinner.show();
    this.showLoader = true;
    this.dashboardService.matchBonusDetail('/dashboard/match').then((res: any) => {
      // this.spinner.hide();
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
      this.showLoader = false;
      // this.spinner.hide();
    });
  }
}
