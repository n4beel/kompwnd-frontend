import { Component, OnDestroy, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "src/_services/auth.service";
import { EosService, GetRowData } from "src/_services/eos.service";
import { MinerService } from "src/_services/mine.service";
import { ConversionService } from "src/_services/conversion.service";
const HASHES_PER_KPW = 129000;

@Component({
    templateUrl: 'mine.page.html',
    styleUrls: ['mine.page.scss']
})
export class MinePage implements OnDestroy{
    prod: boolean = environment.mainnet;
    maxThread: number = 0;
    threads: number = this.mine.threads;
    accepted: number;
    acceptedVal: number;
    accepted_date: string;
    range: number = 100;

    convertedValue: string;
    convertedDaily: string;
    convertedAccepted: string;

    acceptedInterval: NodeJS.Timeout;
    conversionInterval: NodeJS.Timeout;

    message: string;
    messageType: 'error' | 'success';
    messageTimout: NodeJS.Timeout;

    constructor(
        public mine: MinerService,
        private eos: EosService,
        private auth: AuthService,
        private conversion: ConversionService
    ) {
        this.maxThread = this.mine.threads;

        this.eos.on('eosReady').subscribe(() => {
            this.startGetAccepted();
        });
        if(this.eos.ready) {
            this.startGetAccepted();
        }

        this.usdConversion();
        this.conversionInterval = setInterval(() => {this.usdConversion()}, 1000);
    }

    ngOnDestroy() {
        clearInterval(this.acceptedInterval);
        clearInterval(this.conversionInterval);
    }

    editThreads(dir: string) {
        switch(dir) {
            case 'sub':
                if(this.threads - 1 >= 1) this.threads -= 1;
                break;
            case 'add':
                if(this.threads + 1 <= this.maxThread) this.threads += 1;
                break;
        }
        this.mine.setThreads(this.threads);
    }

    startGetAccepted() {
        if(this.prod) {
            this.acceptedInterval = setInterval(() => {
                this.getAccepted();
            }, 15000);
            this.getAccepted();
        }
    }

    getAccepted() {
        this.eos.getRows({
            scope: this.auth.user.username,
            table: 'hashes',
            contract: 'kompwnd',
        }).then((result: GetRowData) => {
            if(result.rows.length) {
                let accepted = result.rows[0];
                this.accepted = accepted.hashes;
                this.acceptedVal = +(accepted.hashes / HASHES_PER_KPW).toFixed(4);
                this.accepted_date = accepted.updated;
                this.conversion.kpwtousd(this.acceptedVal).then((data) => this.convertedAccepted = data);
            }
        })
    }

    onClaimHashes() {
        this.eos.pushTransaction('claimhashes', this.auth.user.username, {user: this.auth.user.username}).then((result: any) => {
            console.log(result);
            if(result.transaction_id) {

            } else {
                let err = JSON.parse(result);
                console.log(err);
                this.showMessage(err.error.details[0].message.split(': ').pop(), true)
            }
        })
    }

    onDepositHashes() {
        this.eos.pushTransaction('deposithash', this.auth.user.username, {user: this.auth.user.username}).then((result: any) => {
            console.log(result);
            if(result.transaction_id) {

            } else {
                let err = JSON.parse(result);
                console.log(err);
                this.showMessage(err.error.details[0].message.split(': ').pop(), true)
            }
        })
    }

    editUtilization(ev: Event) {
        this.mine.setThrottle(100 - this.range);
    }

    get getDaily() {
        return (this.mine.hashesSecond ? (this.mine.hashesSecond * 86400) / HASHES_PER_KPW : 0).toFixed(4);
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

    async usdConversion() {
        this.convertedValue = await this.conversion.kpwtousd(this.mine.Value);
        this.conversion.kpwtousd(+this.getDaily).then((data) => this.convertedDaily = data);
    }
}