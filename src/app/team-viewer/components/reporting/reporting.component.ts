import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, take } from 'rxjs/operators';
import { ConversionService } from 'src/app/services/conversion.service';
import { TeamViewerService } from '../../team-viewer.service';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {
  @ViewChild("elementRef") private elementRef: ElementRef<HTMLElement>;
  currentDate = new Date()
  reportSearchFilterForm: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    dateRange: new FormControl(''),
    reportType: new FormControl('deposit'),
  });
  spList = [0, 1, 2, 3, 'SP', 'SP 1', 'SP 2', 'SP 3', 'SP 4', 'SP 5', 'SP 6']
  reportingData;
  deposits: boolean;
  showDropDown = false;
  reportTypeList = ['Deposit', 'Earning', 'Rank'];
  lastDateOfMonth = new Date()
  loading: boolean = false;
  responseRecieved: boolean = false;
  showLoader: boolean = false;
  selectedReportType = '';
  usdConversionValue: any;

  errorHeading = '';
  errorMessage = '';
  showError = false;
  constructor(
    private teamViewerService: TeamViewerService,
    private conversionService: ConversionService
  ) {
    this.currentDate = new Date();
  }

  async ngOnInit() {
    await this.getUsdConversionValue()
    var date = new Date();
    this.lastDateOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  async getUsdConversionValue() {
    this.usdConversionValue = await this.conversionService.getKPWUsd();
  }
  GetReports() {
    this.responseRecieved = false;
    this.showError = false;
    this.showLoader = true;
    this.reportSearchFilterForm.markAllAsTouched();
    if (this.reportSearchFilterForm.invalid) {
      this.reportSearchFilterForm.markAsDirty();
      this.showLoader = false;
      return;
    }
    this.teamViewerService.getReports(this.reportSearchFilterForm.value)
      .then((result: any) => {
        this.selectedReportType = this.reportSearchFilterForm.controls['reportType']?.value
        this.responseRecieved = true;
        console.log(result)
        this.reportingData = result;
        this.showLoader = false;
      }).catch((error) => {
        console.log(error)
        this.showError = true;
        this.errorHeading = 'Error'
        this.errorMessage = 'User does not exist.';
        this.showLoader = false;
      });
  }

  onReportTypeClick(item) {
    this.reportSearchFilterForm.get('reportType').setValue(item.toLowerCase());
    this.showDropDown = false;
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement && !this.elementRef.nativeElement.contains(targetElement)) {
      this.showDropDown = false;
    }
  }
}
