import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { ComponentsModule } from "src/_components/components.module";
import { TeamViewerPage } from "./team-viewer.page";

const routes: Routes = [
    {
        path: '',
        component: TeamViewerPage
    }
]

@NgModule({
    declarations: [
        TeamViewerPage
    ],
    entryComponents: [
        TeamViewerPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        ComponentsModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class TeamViewerPageModule {}