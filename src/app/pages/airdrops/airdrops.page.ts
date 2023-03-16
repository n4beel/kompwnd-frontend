import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { timeStamp } from "console";
import { AuthService } from "src/_services/auth.service";
import { Buddies, EosService, Token } from "src/_services/eos.service";

@Component({
    templateUrl: 'airdrops.page.html',
    styleUrls: ['airdrops.page.scss'],
    preserveWhitespaces: false
})
export class AirdropsPage {
    @ViewChild('log') log: ElementRef;
    drop: AirDrop = {
        user: null,
        team: null,
        deposit: null,
        drop: null,
        depth: null,
        directs: null,
        type: 0,
        status: null,
    }
    deposit: number;
    kpwAvailable: Token;
    team: Buddies;

    successRun: boolean = false;

    message: string;
    messageType: 'error' | 'success';
    messageTimout: NodeJS.Timeout;

    testRunLog: string[] = [];
    logRunning: boolean = true;

    constructor(
        private auth: AuthService,
        private eos: EosService
    ) {
        if(this.eos.ready) {
            // this.getAirDrop();
            this.getAirDrop();
            this.getBalance();
        } else {
            this.eos.on('eosReady').subscribe(() => {
                // this.getAirDrop();
                this.getBalance();
            })
        }
    }

    getBalance() {
        if(this.auth.user) {
            this.eos.getBalance(this.auth.user.username, 'kompwndtoken', 'KPW').then((data:any) =>{
                this.kpwAvailable = this.eos.toToken(data.data);
            })
        }
    }

    getAirDrop() {
        if(this.auth.user) {
            this.eos.getRows({
                table: 'airdrop',
                contract: 'kompwnd',
                lower_bound: this.auth.user.username
            }).then(async (data:any) => {
                console.log(data);
                
            })
        }
    }

    async onRunTest() {
        this.testRunLog = [];
        if(this.drop.team == null || this.drop.team == '') {
            this.showMessage('Must supply a username for a team to run the Airdrop on', true);
            return;
        }
        if(this.drop.drop == null) {
            this.showMessage('Must set a budget for the campaign', true);
            return;
        }
        if(this.drop.directs == null) {
            this.drop.directs = 0;
        }
        if(this.drop.depth == null) {
            this.drop.depth = 0;
        }
        if(this.drop.deposit == null) {
            this.drop.deposit = 0;
        }
        this.logRunning = true;
        this.team = await this.eos.getTeam(this.drop.team, true);
        let logLines = await this.teamToLines(this.team);

        ([
            'Running Air Drop Test',
            '--------------------------------------',
        ]).forEach((line) => {
            this.runlog(line);
        });
        await new Promise((res) => setTimeout(res, 200));
        ([
            '',
            `Team: ${this.drop.team}`,
            `Campaign Type: ${this.drop.type}`,
            `Minimum Directs: ${this.drop.directs}`,
            `Team Depth: ${this.drop.drop}`,
            `Minimun Net Deposit: ${this.eos.toString({value: Number(this.drop.deposit), precision: 4, symbol: 'KPW'})}`,
            '',
            '--------------------------------------'
        ]).forEach((line) => {
            this.runlog(line);
        })
        await new Promise((res) => setTimeout(res, 2000));
        for(let line of logLines) {
            await new Promise((res) => {
                setTimeout(res, 30);
            });
            this.runlog(line);
        }
        this.runlog('');
        await new Promise((res) => setTimeout(res, 3000));

        let balance:any
        let sufficientBalance = false;
        let walletConnected = false;

        if(this.auth.user) {
            walletConnected = true;
            balance = await this.eos.getBalance(this.auth.user.username, 'kompwndtoken', 'KPW');
            sufficientBalance = this.drop.drop <= this.eos.toToken(balance.data).value;
        }
        let [matchingUsers, matchLines] = await this.getMatchingUsers(this.team);
        let success = sufficientBalance && matchingUsers.length > 0 && (matchingUsers.length >= this.drop.type || this.drop.type == 0);

        let accountLinesArr = walletConnected ? [
            `Your Balance: ${balance.data}`,
            (!sufficientBalance ? 'Insuficcient Balance' : 'Sufficient Balance to run Airdrop')
        ] : [
            `Wallet not connected`
        ];


        matchLines = matchLines.concat([
            '',
            '--------------------------------------',
            '',
            `Matching Users: ${matchingUsers.length}`,
            `Users: ${matchingUsers.join(', ')}`,
            `Campaign Budget: ${this.eos.toString({value: Number(this.drop.drop), precision: 4, symbol: 'KPW'})}`,
            ...accountLinesArr,
            '',
            `Successful Campaign: ${success}`
        ]);
        for(let line of matchLines) {
            await new Promise((res) => {
                setTimeout(res, 50);
            });
            this.runlog(line);
        }
        this.successRun = success;
        this.logRunning = false;
        console.log('Matching: ', matchingUsers);
        console.log('Main Log', this.testRunLog);
        console.log('LOG', logLines);
    }

    async getMatchingUsers(buddies: Buddies, depth: number = 0) {
        let accumulator: string[] = [];
        let lines: string[] = [];
        console.log('Testing user: ', buddies.user);
        lines.push('');
        lines.push(`Testing User: ${buddies.user}`);

        if(buddies.deposit && depth > 0) {
            console.log('Deposit: ', buddies.deposit);
            lines.push(`${buddies.user} has an active deposit`);
            let match = true;
            if(buddies.buddies.length < this.drop.directs && this.drop.directs > 0) {
                match = false;
                lines.push(`${buddies.user} does not meet the minimum direct buddy requirement of ${this.drop.directs} currently has ${buddies.buddies.length}`)
            }
            if(buddies.deposit.deposit.value < this.drop.deposit) {
                match = false;
                lines.push(`${buddies.user} deposit ${this.eos.toString(buddies.deposit.deposit)} does not meet the minimum deposit of ${this.eos.toString({value: Number(this.drop.deposit), precision: 4, symbol: 'KPW'})}`)
            }
            if(match) {
                accumulator.push(buddies.user);
                lines.push(`${buddies.user} meets all the matching requirements`);
            }
            
        } else {
            lines.push(`${buddies.user} does not have an active deposit`);
        }
        if(buddies.buddies.length && (this.drop.depth == 0 || depth+1 <= this.drop.depth)) {
            for(let buddy of buddies.buddies) {
                let [submatch, sublines] = await this.getMatchingUsers(buddy, depth + 1);
                console.log('Buddies: ', submatch);
                lines = lines.concat(sublines);
                if(submatch && submatch.length) {
                    accumulator = accumulator.concat(submatch);
                }
            }
        }
        return [accumulator, lines];
    }

    runlog(str: string) {
        this.testRunLog.push(str);
        setTimeout(() => {
            let log: HTMLElement = this.log.nativeElement;
            log.scrollTo(0, log.scrollHeight + 30);
        }, 100)
    }

    async teamToLines(team: Buddies) {
        let lines: string[] = [];
        lines.push('{');
        lines.push(`    username: ${team.user},`);
        lines.push(`    deposit: ${team.deposit ? '{' : 'null'}`);
        if(team.deposit) {
            for(let key of Object.keys(team.deposit)) {
                let value = team.deposit[key].hasOwnProperty('value') ? this.eos.toString(team.deposit[key]) : new Date(team.deposit[key] * 1000).toISOString();
                lines.push(`        ${key}: "${value}"`);
            }
            lines.push('    },')
        }
        lines.push(`    buddies: ${team.buddies.length ? '[' : 'null'}`);
        if(team.buddies.length) {
            for(let buddy of team.buddies) {
                let buddylines = await this.teamToLines(buddy);
                buddylines = buddylines.map(l => `        ${l}`);
                lines = lines.concat(buddylines);
            }
            lines.push(`    ]`);
        }
        lines.push(`}`);
        
        return lines;
    }

    async onSend() {
        if(!this.successRun) {
            this.showMessage('Must run seccessful test run first', true);
            return;
        }
        this.logRunning = true;
        ([
            '',
            'Submitting Air drop variables',
            '--------------------------------------',
        ]).forEach((line) => {
            this.runlog(line);
        });
        let id = this.eos.generateName();
        let varData = {
            id,
            depth: this.drop.depth,
            directs: this.drop.directs,
            type: this.drop.type,
            deposit: this.eos.toString({value: this.drop.deposit, precision: 4, symbol: 'KPW'}),
            team: this.drop.team,
            user: this.auth.user.username
        }
        this.eos.pushTransaction('dropvars', this.auth.user.username, varData, 'kompwnd').then(async (data: any) => {
            console.log(data);
            if(data.transaction_id) {
                ([
                    '',
                    'Airdrop Variables Subitted',
                    `Transaction ID: ${data.transaction_id}`,
                    '--------------------------------------',
                    '',
                    'Funding Airdrop Campaign',
                    '--------------------------------------'
                ]).forEach((line) => {
                    this.runlog(line);
                });
                this.eos.pushTransaction('transfer', this.auth.user.username, {
                    from: this.auth.user.username,
                    to: 'kompwnd',
                    quantity: this.eos.toString({value: this.drop.drop, precision: 4, symbol: 'KPW'}),
                    memo: `airdrop:${id}`
                }, 'kompwndtoken').then(async (data: any) => {
                    console.log('FUND', data);
                    
                    if(data.transaction_id) {
                        ([
                            '',
                            'Airdrop Funded Successfully',
                            `Transaction ID: ${data.transaction_id}`,
                            '--------------------------------------',
                        ]).forEach((line) => {
                            this.runlog(line);
                        });

                        data.processed.action_traces.forEach((trace, index) => {
                            this.runlog('Action Trace: '+index);
                            trace.inline_traces.forEach((iTrace, index) => {
                                this.runlog('Inline  Action Trace: '+index);
                                let lines = iTrace.console.split('\n')
                                lines.forEach(line => {
                                    this.runlog(line);
                                });
                            })
                        });
                        this.logRunning = false;
                    } else {
                        this.runlog(data);
                    }
                })

            } else {
                this.runlog(data);
            }
            
        })
        console.log(this.drop);
        
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

interface AirDrop {
    user: string;
    team: string;
    deposit: number;
    drop: number;
    depth: number;
    directs: number;
    type: number;
    status?: string;
}