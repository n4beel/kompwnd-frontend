import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { SwapPage } from "./swap.page";

const routes: Routes = [
    {
        path: '',
        component: SwapPage
    }
]

@NgModule({
    declarations: [
        SwapPage
    ],
    entryComponents: [
        SwapPage
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
export class SwapModule { }