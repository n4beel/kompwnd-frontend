import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { ComponentsModule } from "src/_components/components.module";
import { AirdropsPage } from "./airdrops.page";

const routes: Routes = [
    {
        path: '',
        component: AirdropsPage
    }
]

@NgModule({
    declarations: [
        AirdropsPage
    ],
    entryComponents: [
        AirdropsPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        ComponentsModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class AirdropsPageModule {}