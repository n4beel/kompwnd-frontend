import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { MarkdownModule } from "ngx-markdown";
import { ComponentsModule } from "src/_components/components.module";
import { PaymentPage } from "./payment.page";

const routes: Routes = [
    {
        path: '',
        component: PaymentPage
    }
]

@NgModule({
    declarations: [
        PaymentPage
    ],
    entryComponents: [
        PaymentPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        ComponentsModule,
        MarkdownModule.forChild(),
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class PaymentModule {}