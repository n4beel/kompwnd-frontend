import { Component } from "@angular/core";
import { AuthService } from "src/_services/auth.service";
import { EosService, GetRowData, Token } from "src/_services/eos.service";

@Component({
    templateUrl: 'swap.page.html',
    styleUrls: ['swap.page.scss']
})
export class SwapPage {
    // SWAP VARS
    fromToken: Token;
    toToken: Token;
    
    fromSwap: SwapToken;
    toSwap: SwapToken;

    fromValue: number;
    toValue: number;

    fromSymbol: string;
    toSymbol: string;
    // SWAP VARS END
    
    kpwSwap: SwapToken;
    alaSwap: SwapToken;

    swapTokens: SwapToken[];

    swapFees: string[] = [];
    
    messageBuy: string;
    messageSell: string;
    messageType: 'error' | 'success';
    messageTimout: NodeJS.Timeout;

    constructor(
        private eos: EosService,
        private auth: AuthService
    ) {
        this.onGetBalances();
        // this.onCalcEstimate('KPW')

        this.eos.on('eosReady').subscribe(() => {
            this.onGetBalances();
        })
    }

    async onCalcEstimate(to = false) {
        let fees: string[] = [];
        if((this.fromValue && !to || this.toValue && to) && this.fromSymbol != this.toSymbol) {
            console.log(this.fromToken.symbol, this.toToken.symbol);
            
            if(this.fromToken.symbol == 'ALA' || this.toToken.symbol == 'ALA') {
                // tok to ala or ala to tok
                let tok_contract = this.fromSwap.tok_symbol == "4,ALA" ? this.toSwap.account : this.fromSwap.account;
                if(!to) {
                    console.log('FROM TO');
                    
                    let quantity = this.eos.toToken(this.fromValue.toFixed(this.fromToken.precision) + ' ' + this.fromToken.symbol);
    
                    let result = await this.getFromTo(tok_contract, this.fromSwap, this.toSwap, quantity);
                    fees.push(...result.fees);
                    this.toValue = result.return.value;
                } else {
                    console.log('TO FROM');
                    
                    let quantity = this.eos.toToken(this.toValue.toFixed(this.toToken.precision) + ' ' + this.toToken.symbol);
                    let result = await this.getToFrom(tok_contract, this.fromSwap, this.toSwap, quantity);
                    fees.push(...result.fees);
                    this.fromValue = result.return.value;
                }

            } else {
                // tok to tok
                if(!to) {
                    let tok_contract = this.fromSwap.account;
                    let quantity = this.eos.toToken(this.fromValue.toFixed(this.fromToken.precision) + ' ' + this.fromToken.symbol);
                    
                    let alaresult = await this.getFromTo(tok_contract, this.fromSwap, this.alaSwap, quantity);
                    fees.push(...alaresult.fees);
                    let alaValue = alaresult.return;

                    tok_contract = this.toSwap.account;
                    let tokresult = await this.getFromTo(tok_contract, this.alaSwap, this.toSwap, alaValue)
                    fees.push(...tokresult.fees);
                    this.toValue = tokresult.return.value;
                } else {
                    let tok_contract = this.toSwap.account;
                    let quantity = this.eos.toToken(this.toValue.toFixed(this.toToken.precision) + ' ' + this.toToken.symbol);
                    let alaresult = await this.getToFrom(tok_contract,  this.alaSwap, this.toSwap, quantity);
                    let alaValue = alaresult.return;

                    let fromresult = await this.getToFrom(this.fromSwap.account, this.fromSwap, this.alaSwap, alaValue);
                    fees.push(...fromresult.fees, ...alaresult.fees);
                    this.fromValue = fromresult.return.value;
                }
            }

            this.swapFees = fees;

        } else {
            this.toValue = null;

            if(this.fromSymbol == this.toSymbol) {
                this.showMessage('Cannot swap KPW to KPW');
            }
        }
    }

    async getFromTo(contract: string, from: SwapToken, to: SwapToken, quantity: Token ): Promise<SwapReturn> {
        let swap: SwapReturn = {
            return: {
                value: 0,
                symbol: '',
                precision: 0
            },
            fees: []
        }

        let from_balance = this.eos.toToken( (await <Promise<any>>this.eos.getBalance(contract, from.tok_contract, from.tok_symbol.split(',').pop())).data);
        let to_balance = this.eos.toToken( (await <Promise<any>>this.eos.getBalance(contract, to.tok_contract, to.tok_symbol.split(',').pop())).data);
        let value = parseFloat(quantity.value.toFixed(quantity.precision));
        let fee = value * .03;
        console.log(from_balance, to_balance);
        
        swap.fees.push(fee.toFixed(from_balance.precision) + ' ' + from_balance.symbol);
        let after_from_pool = from_balance.value + parseFloat(Number(value).toFixed(from_balance.precision)) - fee;
        let inv = from_balance.value * to_balance.value;
        let after_to_pool = inv / after_from_pool;
        let returnValue = to_balance.value - after_to_pool;
        swap.return = this.eos.toToken(returnValue.toFixed(to_balance.precision) + ' ' + to_balance.symbol);

        return swap;
    }

    async getToFrom(contract: string, from: SwapToken, to: SwapToken, quantity: Token): Promise<SwapReturn> {
        let swap: SwapReturn = {
            return: {
                value: 0,
                symbol: '',
                precision: 0
            },
            fees: []
        }

        let from_symbol = from.tok_symbol.split(',').pop();
        let to_symbol = to.tok_symbol.split(',').pop()
        let fee = [from_symbol, to_symbol].includes('KPW') ? 0.03 : 0.003;
        let from_balance = this.eos.toToken( (await <Promise<any>>this.eos.getBalance(contract, from.tok_contract, from_symbol)).data);
        let to_balance = this.eos.toToken( (await <Promise<any>>this.eos.getBalance(contract, to.tok_contract, to_symbol)).data);
        let return_amount = -((from_balance.value * quantity.value ) / ((1 - fee)*(quantity.value - to_balance.value )));
        swap.return = this.eos.toToken(return_amount.toFixed(from_balance.precision) + ' ' + from_balance.symbol);
        swap.fees.push((swap.return.value * fee).toFixed(from_balance.precision) + ' ' + from_balance.symbol);
        console.log(swap);
        
        return swap;
    }

    async onGetBalances() {
        let result = await <Promise<GetRowData>>this.eos.getRows({
            table: 'exchanges',
            contract: 'alaswap',
            scope: 'alaswap'
        });

        this.swapTokens = result.rows;
        if(this.auth.user) {
            this.alaSwap = {
                tok_contract: 'alaio.token',
                tok_symbol: '4,ALA',
                account: null
            }
            this.toSwap = this.alaSwap;
            this.swapTokens.unshift(this.alaSwap);
            this.toToken = this.toSwap.balance = await this.getbalance(this.alaSwap);
            this.toSymbol = this.toToken.symbol;

            for(let i = 0; i < this.swapTokens.length; i++) {
                let s = this.swapTokens[i];
                if(s.tok_symbol == "4,KPW") {
                    this.fromSwap = this.kpwSwap = this.swapTokens[i];
                }
            }
            this.fromToken = this.fromSwap.balance = await this.getbalance(this.fromSwap);
            this.fromSymbol = this.fromToken.symbol;
            
            // this.eos.getBalance(this.auth.user.username, 'kompwndtoken', 'KPW').subscribe((data:any) => {
            //     console.log(data);
            //     let token = this.eos.toToken(data.data);
            //     if(this.fromToken) {
            //         if(token.symbol == this.fromToken.symbol) {
            //             this.fromToken = token;
            //         } else {
            //             this.toToken = token;
            //         }
            //     } else {
            //         this.fromToken = this.kpwAvailable = token;
            //     }
            // })
            // this.eos.getBalance(this.auth.user.username, 'alaio.token', 'ALA').subscribe((data:any) => {
            //     console.log(data);
            //     let token = this.eos.toToken(data.data);
            //     if(this.toToken) {
            //         if(token.symbol == this.toToken.symbol) {
            //             this.toToken = token;
            //         } else {
            //             this.fromToken = token;
            //         }
            //     } else {
            //         this.toToken = this.alaAvailable = token;
            //     }
            // })
        }
    }

    async getbalance(contract: SwapToken, force: boolean = false) {
        if(!contract.balance || force) {
            let result = await <Promise<any>>this.eos.getBalance(this.auth.user.username, contract.tok_contract, contract.tok_symbol.split(",").pop());
            let tok: Token = this.eos.toToken(result.data);
            console.log(tok);
            
            return tok
        } else {
            return contract.balance;
        }
    }

    async onCheckSymbol(edited: 'from' | 'to') {
        this.swapTokens.forEach(async (s) => {
            if (edited == 'from') {
                if(s.tok_symbol.split(',').pop() == this.fromSymbol) {
                    this.fromSwap = s;
                    this.fromToken = await this.getbalance(this.fromSwap);
                }
            } else {
                if(s.tok_symbol.split(',').pop() == this.toSymbol) {
                    this.toSwap = s;
                    this.toToken = await this.getbalance(this.toSwap);
                }
            }
        })

        if(this.fromSymbol != 'KPW' || this.toSymbol != 'KPW') {
            if(edited == 'from') {
                this.toSwap = this.kpwSwap;
                this.toToken = await this.getbalance(this.toSwap);
                this.toSymbol = this.toToken.symbol;
            } else {
                this.fromSwap = this.kpwSwap;
                this.fromToken = await this.getbalance(this.fromSwap);
                this.fromSymbol = this.fromToken.symbol;
            }

            console.log(this.fromSwap, this.fromToken, this.fromSymbol);
            console.log(this.toSwap, this.toToken, this.toSymbol);
        }

        this.onCalcEstimate()
    }

    swapFromTo() {
        console.log(this.fromSwap, this.fromToken, this.fromSymbol);
        console.log(this.toSwap, this.toToken, this.toSymbol);
        
        let tmp = this.toToken;
        let tmpS = this.toSwap;
        this.toToken = this.fromToken;
        this.toSwap = this.fromSwap;
        this.toSymbol = this.toToken.symbol;

        this.fromToken = tmp;
        this.fromSwap = tmpS;
        this.fromSymbol = this.fromToken.symbol;

        this.onCalcEstimate();
    }

    onSwap(type: string) {
        if(this.auth.user != null) {
            let to_contract = this.fromSymbol == 'ALA' || this.toSymbol == 'ALA' ? this.fromSymbol == 'ALA' ? this.toSwap.account : this.fromSwap.account : this.fromSwap.account

            let data = {
                from: this.auth.user.username,
                to: to_contract,
                quantity: Number(this.fromValue).toFixed(this.fromToken.precision) + ' ' + this.fromToken.symbol,
                memo: `${this.fromSwap.tok_contract}:${this.toSwap.tok_contract}`
            }

            console.log(data, to_contract);
            
            this.eos.pushTransaction('transfer', this.auth.user.username, {
                from: this.auth.user.username,
                to: to_contract,
                quantity: Number(this.fromValue).toFixed(this.fromToken.precision) + ' ' + this.fromToken.symbol,
                memo: `${this.fromSwap.tok_contract}:${this.toSwap.tok_contract}`
            }, this.fromSwap.tok_contract).then(async (data:any) => {

                if(data.transaction_id) {
                    console.log(data);
                    this.fromValue = null;
                    this.toValue = null;
                    this.fromToken = await this.getbalance(this.fromSwap, true);
                    this.toToken = await this.getbalance(this.toSwap, true);
                    this.swapFees = [];
                    this.eos.emit('balanceUpdate', {});
                } else {
                    console.log(data);
                    
                    data = JSON.parse(data);
                    this.showMessage('Error: ' + data.error.details[0].message.split(': ').pop());
                }

                
            })
        } else {
            this.showMessage('Connect Wallet before you can Buy');
        }
    }


    showMessage(message: string) {
        this.hideMessage();
        this.messageBuy = message;
        this.messageTimout = setTimeout(() => { this.hideMessage() }, 5000)
    }

    hideMessage() {
        this.messageBuy = null;
        this.messageSell = null;
        clearTimeout(this.messageTimout);
    }
}

interface SwapToken {
    account: string;
    tok_contract: string;
    tok_symbol: string;
    balance?: Token;
}

interface SwapReturn {
    return: Token;
    fees: string[];
}