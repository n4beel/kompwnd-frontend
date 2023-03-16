import { Component, Input, OnInit } from "@angular/core";
import { chartData } from "../../app/pages/kompwnd/kompwnd.page";
@Component({
    selector: 'report-table',
    templateUrl: 'report-table.component.html',
    styleUrls: ['report-table.component.scss']
})
export class ReportTable{
    @Input('data') reportData: chartData;
    constructor() {

    }

}