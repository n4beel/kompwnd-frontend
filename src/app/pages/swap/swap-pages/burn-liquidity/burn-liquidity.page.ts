import { Component } from "@angular/core";
import { AuthService } from "src/_services/auth.service";
import { EosService, Token } from "src/_services/eos.service";

@Component({
    templateUrl: 'burn-liquidity.page.html',
    styleUrls: ['burn-liquidity.page.scss']
})
export class BurnLiquidityPage {
    omnikpwBalance: Token;
    burnValue: number;

    returnTokens: Token[] = [];

    message: string;
    messageTimout: NodeJS.Timeout;

    constructor(
        private auth: AuthService,
        private eos: EosService
    ) {
        this.onGetBalances();
    }

    async onGetBalances() {
        if(this.auth.user) {
            this.eos.getBalance(this.auth.user.username, 'alaswaptoken', 'OMNIKPD').then((data:any) => {
                this.omnikpwBalance = this.eos.toToken(data.data);
            })
        } else {
            this.omnikpwBalance = this.eos.toToken('0.0000 OMNIKPD');
        }
    }

    async onCalcReturn() {
        if(this.burnValue) {
            let omnikpwBalance = this.eos.toToken((await <Promise<any>> this.eos.getBalance('kpw.alaswap', 'alaswaptoken', 'OMNIKPD')).data);
            let alaBalance = this.eos.toToken((await <Promise<any>> this.eos.getBalance('kpw.alaswap', 'alaio.token', 'ALA')).data);
            let kpwBalance = this.eos.toToken((await <Promise<any>> this.eos.getBalance('kpw.alaswap', 'kompwndtoken', 'KPW')).data);

            this.returnTokens = [
                this.eos.toToken((+this.burnValue.toFixed(omnikpwBalance.precision) * alaBalance.value / (1000000000 - omnikpwBalance.value)).toFixed(alaBalance.precision) + ' ' + alaBalance.symbol),
                this.eos.toToken((+this.burnValue.toFixed(omnikpwBalance.precision) * kpwBalance.value / (1000000000 - omnikpwBalance.value)).toFixed(kpwBalance.precision) + ' ' + kpwBalance.symbol)
            ];
        } else {
            this.returnTokens = [];
        }
    }

    async onBurnLiquidity() {
        let result: any = await this.eos.pushTransaction('transfer', this.auth.user.username, {
            from: this.auth.user.username,
            to: 'kpw.alaswap',
            quantity: this.burnValue.toFixed(this.omnikpwBalance.precision) + ' ' + this.omnikpwBalance.symbol,
            memo: 'burn_liquidity'
        }, 'alaswaptoken');
        if(result.transaction_id) {
            this.burnValue = null;
            this.returnTokens = [];
        } else {
            this.showMessage(result.error.details[0].message.split(':').pop());
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