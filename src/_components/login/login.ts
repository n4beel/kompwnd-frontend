import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "src/_services/auth.service";
import { SystemService } from "src/_services/system.service";
import { ProfileService } from "src/_services/profile.service";

@Component({
    templateUrl: 'login.html',
    styleUrls: ['login.scss']
})
export class LoginModal {
    password;
    mnemonicCode;
    email;

    loading: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<LoginModal>,
        private auth: AuthService,
        private system: SystemService,
        private profile: ProfileService
    ) {

    }

    onSubmit() {
        this.loading = true;

        if((!this.password || this.password == "") && (!this.mnemonicCode || this.mnemonicCode == "")) {
            this.system.showToast({message: 'Password and Mnemonic Code is required'});
            this.loading = false;
            return;
        }

        if(!this.password || this.password == "") {
            this.system.showToast({message: 'Password is required'});
            this.loading = false;
            return;
        }

        if(!this.mnemonicCode || this.mnemonicCode == "") {
            this.system.showToast({message: 'Mnemonic Code is required'});
            this.loading = false;
            return;
        }

        setTimeout(() => {
            this.auth.login(this.password, this.mnemonicCode).then(async (response: any) => {
                console.log(response);
                this.auth.setUser(response);
                this.profile.getProfile(this.auth.user.username);
                this.dialogRef.close();
                this.profile.initialize();
                this.loading = false;
            }).catch((err) => {
                this.loading = false;
                console.log(err);
                this.system.showToast({message: err});
            })
        }, 100)

        // this.dialogRef.close({
        //     email: this.email,
        //     mnemonic: this.mnemonicCode,
        //     password: this.password
        // });
    }
}