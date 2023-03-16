import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as Chart from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConversionService } from 'src/app/services/conversion.service';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  detail;
  usdConversionValue = 0;
  intervalId: NodeJS.Timeout;
  dividendInterval: NodeJS.Timeout;

  @ViewChild('lineCanvas') lineCanvas: ElementRef | undefined;
  lineChart: any;
  colors =
    {
      purple: {
        default: "rgba(233, 31, 146, 1)",
        half: "rgba(233, 31, 146, 0.5)",
        quarter: "rgba(233, 31, 146, 0.25)",
        zero: "rgba(233, 31, 146, 0)"
      },
      indigo: {
        default: "rgba(80, 102, 120, 1)",
        quarter: "rgba(80, 102, 120, 0.25)"
      }
    }
  context: CanvasRenderingContext2D;

   graphData = []
   timeList = [{key: '1H', value: 1 }, {key: '4H', value: 4 }, {key: '1D', value: 24 }, {key: '1M', value: 720 }]
   selectedTime: any;
   kpwPrice: any;


  constructor(private dashboardService: DashboardService,
    private router: Router,
    private conversionService: ConversionService,
    private spinner: NgxSpinnerService) { }

  async ngOnInit() {
    this.spinner.show();
    this.intervalId = setInterval(async () => {
      await this.getUsdConversionValue()
    }, 1000);
    this.getDahboardData();
    this.getPriceGraphData(4)
  }

  async getUsdConversionValue() {
    const conversionValue = await this.conversionService.getKPWUsd();
    this.usdConversionValue = conversionValue ? conversionValue : 0;
  }

  getDahboardData() {
    this.dashboardService.detail('/dashboard').then((res: any) => {
      if (res) {
        this.detail = Object.assign(res, { total_amount: res.available_dividend + res.available_ref_bonus + res.available_match_bonus });
        if (this.detail.available_dividend > 0 && this.detail.daily_dividend > 0 && this.detail.is_deposit_active) {
          this.dividendInterval = setInterval(() => this.increaseAvailableDividend(), 1000)
        }

      }
      this.spinner.hide();
    });
  }

  getPriceGraphData(value) {
    this.clearChart()
    this.selectedTime = value
    this.dashboardService.priceGraphDetail(`/token/getKpwPrice?hours=${value}`).then((res: any) => {
      if (res && res.length > 0) {
        this.graphData = res.map(a => {
          return {
            label: new Date(+a.time).toLocaleString(),
            data: a.price
          }
        })
        this.kpwPrice = 1;
        this.lineChartMethod();
      }
    });
  }

  clearChart() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
  }
  onTeamClick() {
    this.router.navigate(['/dashboard/team-viewer'], {state: {data: {showConnectedUserTeam: true}}})
  }

  lineChartMethod() {
    const ctx = (<HTMLCanvasElement>this.lineCanvas.nativeElement).getContext("2d");
    ctx.canvas.height = 100;
    const gradient = ctx.createLinearGradient(0, 25, 0, 300);
    gradient.addColorStop(0, this.colors.purple.half);
    gradient.addColorStop(0.35, this.colors.purple.zero);
    gradient.addColorStop(1, this.colors.purple.zero);
    const options = {
      type: "line",
      data: {
        labels: this.graphData.map(a => a.label),
        datasets: [
          {
            fill: true,
            backgroundColor: gradient,
            pointBackgroundColor: this.colors.purple.default,
            borderColor: this.colors.purple.default,
            radius: 0,
            data: this.graphData.map(a => a.data),
            lineTension: 0.2,
            borderWidth: 4,
          }
        ]
      },
      options: {
        tooltips: {
          enabled: true
        },
        layout: {
          padding: 10
        },
        responsive: true,
        legend: {
          display: false
        },

        scales: {
          xAxes: [
            {display: false}
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                padding: 10
              },
              gridLines: {
                display: false,
              },
              ticks: {
                padding: 10,
                callback: function(value, index, ticks) {
                  return value.toFixed(2) + 'K';
              }
              }
            }
          ]
        }
      }
    };
    this.lineChart = new Chart(ctx, options);
  }

  increaseAvailableDividend() {
    const secondsInDay = 86400;
    const incrementedDividend = this.detail.daily_dividend / secondsInDay;
    if (incrementedDividend > 0) {
      this.detail.available_dividend = this.detail.available_dividend + incrementedDividend
      this.detail.total_amount = this.detail.total_amount + incrementedDividend

    }
  }

  ngOnDestroy() {
    clearInterval(this.dividendInterval);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
