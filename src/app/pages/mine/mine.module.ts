import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { ComponentsModule } from "src/_components/components.module";
import { MinePage } from "./mine.page";

const routes: Routes = [
    {
        path: '',
        component: MinePage
    }
]

@NgModule({
    entryComponents: [
        MinePage
    ],
    declarations: [
        MinePage
    ],
    imports: [
        CommonModule,
        FormsModule,
        ComponentsModule,
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class MinePageModule { }