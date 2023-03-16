import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { MarkdownModule } from "ngx-markdown";
import { ComponentsModule } from "src/_components/components.module";
import { CancelPage } from "./cancel.page";

const routes: Routes = [
    {
        path: '',
        component: CancelPage
    }
]

@NgModule({
    declarations: [
        CancelPage
    ],
    entryComponents: [
        CancelPage
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
export class CancelModule {}