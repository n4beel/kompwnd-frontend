import { Component, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';

@Component({
  selector: 'adil-abbas-page',
  templateUrl: 'adil-abbas.page.html',
  styleUrls: ['adil-abbas.page.scss'],
})
export class AdilAbbasPage {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  success: boolean = false;
  loading: boolean = false;

  constructor(private router: Router) {}

  async onClick() {
    this.router.navigate(['/booking']);
  }
}
