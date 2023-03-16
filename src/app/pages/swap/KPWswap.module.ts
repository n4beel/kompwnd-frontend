import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { KPWSwapPage } from "./KPWswap.page";

const routes: Routes = [
    {
        path: '',
        component: KPWSwapPage,
        children: [
            {
                path: '',
                redirectTo: 'swap',
                pathMatch: 'full'
            },
            {
                path: 'swap',
                loadChildren: () => import('./swap-pages/swap/swap.module').then(m => m.SwapModule),
            },
            {
                path: 'add-liquidity',
                loadChildren: () => import('./swap-pages/add-liquidity/add-liquidity.module').then(m => m.AddLiquidityModule),
            },
            {
                path: 'burn-liquidity',
                loadChildren: () => import('./swap-pages/burn-liquidity/burn-liquidity.module').then(m => m.BurnLiquidityModule),
            }
        ]
    }
]

@NgModule({
    declarations: [
        KPWSwapPage
    ],
    entryComponents: [
        KPWSwapPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class KPWSwapPageModule {}