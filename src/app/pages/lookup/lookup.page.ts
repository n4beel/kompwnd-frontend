
import { Component } from "@angular/core";
import { Buddies, EosService, Token } from "src/_services/eos.service";

@Component({
    templateUrl: 'lookup.page.html',
    styleUrls: ['lookup.page.scss']
})
export class LookupPage {
    player: string;

    depositLoaded: boolean = false;
    deposit: any = {};
    buddies: Buddies;
    team = {
        direct: null,
        total: null
    }

    message: string;
    messageType: 'error' | 'success';
    messageTimout: NodeJS.Timeout;

    constructor(
        private eos: EosService
    ) {
        
    }

    async getPlayer() {
        this.depositLoaded = false;
        if(this.player) {
            this.eos.getRows({
                table: 'deposits',
                index: 'secondary',
                lower_bound: this.player,
                limit: 1
            }).then((data: any) => {
                if(data.rows && data.rows.length) {
                    if(data.rows[0].user == this.player) {
                        let row = data.rows[0];
                        this.deposit = {
                            deposit:  this.eos.toToken(row.deposit),
                            divsPayed:  this.eos.toToken(row.divspayed),
                            maxPay:  this.eos.toToken(row.maxdiv),
                            rewards:  this.eos.toToken(row.rewards),
                            match:  this.eos.toToken(row.match),
                            last_action:  row.last_action
                        }
                        this.calcAvailable();
                    }
                }
            })

            let team = this.buddies = await this.eos.getTeam(this.player);
            console.log(this.buddies, team);
            
            this.team.direct = team.buddies.length;
                
            let allBuddies = this.getBuddies(team, true);
            this.team.total = allBuddies.length;
        } else {
            this.showMessage('Must provide and Username to look up');
        }
    }

    calcAvailable() {
        let now = Math.floor(new Date().getTime() / 1000);
        let seconds_dif = now - this.deposit.last_action;
        let past_days = (seconds_dif / 86400) / 100;
        let reward: Token = {
            value: parseFloat(Number(this.deposit.deposit.value * past_days).toFixed(4)),
            precision: this.deposit.deposit.precision,
            symbol: this.deposit.deposit.symbol
        }
        if(reward.value > this.deposit.maxPay.value) reward = this.deposit.maxPay;
        if(!this.deposit.divs || reward.value != this.deposit.divs.value) {
            this.deposit.divs = reward;
        }
        this.depositLoaded = true;
    }

    getBuddies(buddies, skip = false) {
        console.log(buddies.user);
        
        let buddyArr = [];
        if(!skip) buddyArr.push(buddies.user)
        if(buddies.buddies.length) {
            for(let buddy of buddies.buddies) {
                let subBuddies = this.getBuddies(buddy);
                buddyArr = [...buddyArr, ...subBuddies]
            }
        }
        return buddyArr
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
}