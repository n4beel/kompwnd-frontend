import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { ComponentsModule } from "src/_components/components.module";
import { LookupPage } from "./lookup.page";

const routes: Routes = [
    {
        path: '',
        component: LookupPage
    }
]

@NgModule({
    declarations: [
        LookupPage
    ],
    entryComponents: [
        LookupPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        ComponentsModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class LookupPageModule {}