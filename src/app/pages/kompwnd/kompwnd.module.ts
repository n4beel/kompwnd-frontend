import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { ComponentsModule } from "src/_components/components.module";
import { KompwndPage } from "./kompwnd.page";

const routes: Routes = [
    {
        path: '',
        component: KompwndPage
    }
]

@NgModule({
    declarations: [
        KompwndPage
    ],
    entryComponents: [
        KompwndPage
    ],
    imports: [
        NgxChartsModule,
        CommonModule,
        FormsModule,
        ComponentsModule,
        NgbModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class KompwndPageModule {}