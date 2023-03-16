import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { BurnLiquidityPage } from "./burn-liquidity.page";

const routes: Routes = [
    {
        path: '',
        component: BurnLiquidityPage
    }
]

@NgModule({
    declarations: [
        BurnLiquidityPage
    ],
    entryComponents: [
        BurnLiquidityPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class BurnLiquidityModule { }