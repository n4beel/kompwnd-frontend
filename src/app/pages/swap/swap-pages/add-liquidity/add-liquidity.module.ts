import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AddLiquidityPage } from "./add-liquidity.page";

const routes: Routes = [
    {
        path: '',
        component: AddLiquidityPage
    }
]

@NgModule({
    declarations: [
        AddLiquidityPage
    ],
    entryComponents: [
        AddLiquidityPage
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
export class AddLiquidityModule { }