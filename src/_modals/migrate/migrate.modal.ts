import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "src/_services/auth.service";
import { EosService } from "src/_services/eos.service";

@Component({
    templateUrl: 'migrate.modal.html',
    styleUrls: ['migrate.modal.scss']
})
export class MigrateModal {
    message: string;
    messageType: 'error' | 'success';
    messageTimout: NodeJS.Timeout;

    clearMatch: boolean = true;
    clearVars: boolean = true;

    loading: boolean = false;

    constructor(
        private eos: EosService,
        private auth: AuthService,
        private dialogRef: MatDialogRef<MigrateModal>,
        ) {
        
    }

    async migrate() {
        this.loading = true;

        //Add user to the clear_match and clear_vars tables
        await this.eos.pushTransaction(
            'addclear',
            this.auth.user.username,
            {
                user: this.auth.user.username,
            },
            'kompwnd'
        ).then((res: any) => {
            console.log("Add to clear ", res);
        })

        //Clear the user's match table
        await new Promise (async (res, rej) => {
            while(this.clearMatch == true) {
                await this.getClearMatch();

                this.eos.pushTransaction(
                    'emptymatch',
                    this.auth.user.username,
                    {
                        user: this.auth.user.username,
                    },
                    'kompwnd').then((res: any) => {
                        console.log("Clear match ", res);
                })

                if(!this.clearMatch) res(true);
            }
        })

        //Clear the user's vars table
        await new Promise (async (res, rej) => {
            while(this.clearVars == true) {
                await this.getClearVars();

                this.eos.pushTransaction(
                    'emptyvar',
                    this.auth.user.username,
                    {
                        user: this.auth.user.username,
                    },
                    'kompwnd').then((res: any) => {
                        console.log("Clear vars ", res);
                })

                if(!this.clearVars) res(true);
            }
        })

        //Migrate
        this.eos.pushTransaction(
            'migrate', 
            this.auth.user.username, 
            {
                user: this.auth.user.username,
            },
            'kompwnd').then(async (result: any) => {
            if(result.transaction_id) {
                this.dialogRef.close();
            } else {
                this.showMessage(result, true);
            }
        })
    }

    showMessage(message: string, error: boolean = false) {
        this.messageType = error ? 'error' : 'success';
        this.message = message;
        this.messageTimout = setTimeout(() => { this.hideMessage() }, 5000)
    }

    hideMessage() {
        this.message = null;
        clearTimeout(this.messageTimout);
    }

    //Check if the user's match table needs to be cleared
    async getClearMatch() {
        await this.eos.getRows({
            table: 'clearmatch',
            index: 'secondary',
            lower_bound: this.auth.user.username
        }).then((data: any) => {
            if(data.rows && data.rows.length && data.rows[0].user == this.auth.user.username) {
                this.clearMatch = true;
            }
            else {
                this.clearMatch = false;
            }
        })
    }

    //Check if the user's vars table needs to be cleared
    async getClearVars() {
        await this.eos.getRows({
            table: 'clearvars',
            index: 'secondary',
            lower_bound: this.auth.user.username
        }).then((data: any) => {
            if(data.rows && data.rows.length && data.rows[0].user == this.auth.user.username) {
                this.clearVars = true;
            }
            else {
                this.clearVars = false;
            }
        })
    }
}