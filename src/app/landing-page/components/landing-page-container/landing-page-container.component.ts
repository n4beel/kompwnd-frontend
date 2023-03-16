import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ModalDialogService } from 'ngx-modal-dialog';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { LoginComponent } from 'src/app/auth/components/login/login.component';
import { LandingPageService } from 'src/app/services/landing-page.service';

@Component({
  selector: 'app-landing-page-container',
  templateUrl: './landing-page-container.component.html',
  styleUrls: ['./landing-page-container.component.scss']
})
export class LandingPageContainerComponent implements OnInit {
  public carouselOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    nav:true,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 2,
      },
      940: {
        items: 3,
      },
    },
  };
  data;
  constructor(private dialog: MatDialog, private landingPageService: LandingPageService) { }

  ngOnInit(): void {
    this.getData()
    console.log(this.intToString(150000))
  }

  getData() {
    this.landingPageService.getData().then((res: any) => {
      console.log(res)
      if (res && res.status === 200) {
        this.data = Object.assign(res.data, { 
          TotalUsers:  this.intToString(res.data.total_users),
          Investment:  this.intToString(res.data.investment, true),
          Supply:  this.intToString(res.data.circulating_supply, true),
          Payout:  this.intToString(res.data.payout, true),
          Burning:  this.intToString(res.data.burning, true)
        });
      }
    });
  }

  intToString(num, showDollar = false) {
    if (!num) {
      return 0;
    } 

    if (num < 1000) {
        return num;
    }
    let si = [
      {v: 1E3, s: "K"},
      {v: 1E6, s: "M"},
      {v: 1E9, s: "B"},
      {v: 1E12, s: "T"},
      {v: 1E15, s: "P"},
      {v: 1E18, s: "E"}
      ];
    let index;
    for (index = si.length - 1; index > 0; index--) {
        if (num >= si[index].v) {
            break;
        }
    }
    let text = ''
    if (showDollar) {
      text = '$ '
    }
    text = text + Math.floor(num / si[index].v) + si[index].s 
    return text;
}

  onRegisterClick() {
    this.dialog.open(LoginComponent
    );
  }

}
