import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ComponentsModule } from "src/_components/components.module";
import { MigrateModal } from "./migrate/migrate.modal";
import { TierModal } from "./tiers/tier.modal";

@NgModule({
    entryComponents: [
        TierModal,
        MigrateModal
    ],
    declarations: [
        TierModal,
        MigrateModal
    ],
    imports: [
        CommonModule,
        FormsModule,
        ComponentsModule
    ],
    exports: [
        TierModal,
        MigrateModal
    ]
})
export class ModalsModule { }