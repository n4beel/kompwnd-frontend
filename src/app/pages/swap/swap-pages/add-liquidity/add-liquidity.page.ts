import { Component } from "@angular/core";
import { AuthService } from "src/_services/auth.service";
import { EosService, Token } from "src/_services/eos.service";


@Component({
    templateUrl: 'add-liquidity.page.html',
    styleUrls: ['add-liquidity.page.scss']
})
export class AddLiquidityPage {
    alaBalance: Token;
    kpwBalance: Token;

    alaValue: number;
    kpwValue: number;

    liqReturn: Token;
    liqPercent: number = 0;

    message: string;
    messageTimout: NodeJS.Timeout;

    errFixKpw: Token;

    constructor(
        private auth: AuthService,
        private eos: EosService
    ) {
        this.onGetBalances();
    }

    async onGetBalances() {
        if(this.auth.user) {
            this.eos.getBalance(this.auth.user.username, 'kompwndtoken', 'KPW').then((data:any) => {
                console.log(data);
                this.kpwBalance = this.eos.toToken(data.data);
            })
            this.eos.getBalance(this.auth.user.username, 'alaio.token', 'ALA').then((data:any) => {
                console.log(data);
                this.alaBalance = this.eos.toToken(data.data);
            })
        } else {
            this.kpwBalance = this.eos.toToken('0.0000 KPW');
            this.alaBalance = this.eos.toToken('0.0000 ALA');
        }
    }

    async onCalcTok() {
        if(this.alaValue) {
            let alaBalance = this.eos.toToken((await <Promise<any>>this.eos.getBalance('kpw.alaswap', 'alaio.token', 'ALA')).data);
            let kpwBalance = this.eos.toToken((await <Promise<any>>this.eos.getBalance('kpw.alaswap', 'kompwndtoken', 'KPW')).data);
            let liqBal = this.eos.toToken((await <Promise<any>>this.eos.getBalance('kpw.alaswap', 'alaswaptoken', 'OMNIKPD')).data);
            liqBal.value = (1000000000 - liqBal.value);
            let liqRet = Object.assign({}, liqBal);
            liqRet.value = liqRet.value * this.alaValue / alaBalance.value;
            this.liqReturn = liqRet;
            this.liqPercent = +(100 * liqRet.value / (liqRet.value + liqBal.value)).toFixed(2);
            console.log(this.liqPercent, liqRet, liqBal);
            
            this.kpwValue = +(kpwBalance.value * this.alaValue / alaBalance.value).toFixed(kpwBalance.precision) - 0.0001;
        } else {
            this.kpwValue = null;
            this.liqReturn = null;
            this.liqPercent = 0;
        }
    }

    async onAddLiquidity() {
        let alaResult: any = await this.eos.pushTransaction('transfer', this.auth.user.username, {
            from: this.auth.user.username,
            to: 'kpw.alaswap',
            quantity: this.alaValue.toFixed(this.alaBalance.precision) + ' ALA',
            memo: 'add_liquidity'
        }, 'alaio.token');
        let kpwResult: any = await this.eos.pushTransaction('transfer', this.auth.user.username, {
            from: this.auth.user.username,
            to: 'kpw.alaswap',
            quantity: this.kpwValue.toFixed(this.kpwBalance.precision) + ' KPW',
            memo: 'add_liquidity'
        }, 'kompwndtoken')
        if(typeof kpwResult == 'string') {
            let error = JSON.parse(kpwResult);
            this.errFixKpw = this.eos.toToken(error.error.details[0].message.split('of').pop().substr(1));
            console.log(this.errFixKpw);
            this.showMessage("Prending KPW deposit of "+ this.eos.toString(this.errFixKpw));
            
        }
        if(alaResult.transaction_id && kpwResult.transaction_id) {
            this.alaValue = null;
            this.kpwValue = null;
            this.onGetBalances();
        }
        console.log(alaResult, kpwResult);
        
    }

    async onFixLiquidity() {
        let kpwResult: any = await this.eos.pushTransaction('transfer', this.auth.user.username, {
            from: this.auth.user.username,
            to: 'kpw.alaswap',
            quantity: this.eos.toString(this.errFixKpw),
            memo: 'add_liquidity'
        }, 'kompwndtoken');
        console.log(kpwResult);
        if(kpwResult.transaction_id) {
            this.alaValue = null;
            this.kpwValue = null;
            this.errFixKpw = null;
        }
    }

    showMessage(message: string) {
        this.hideMessage();
        this.message = message;
        this.messageTimout = setTimeout(() => { this.hideMessage() }, 5000)
    }

    hideMessage() {
        this.message = null;
        clearTimeout(this.messageTimout);
    }
}