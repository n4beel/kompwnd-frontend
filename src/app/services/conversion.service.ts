import { Injectable } from '@angular/core';
import { EosService, GetRowData } from './eos.service';
import { environment } from "../../environments/environment";
const { mainnet } = environment;
const maxTTL = 30000;

@Injectable({
  providedIn: 'root'
})
export class ConversionService {



  constructor(private eos: EosService) {
  }

  async kpwToUsd(kpw: number): Promise<string> {
    let kpwusd = await this.getKPWUsd();
    let usdReturn = +(kpw * kpwusd);

    if (!usdReturn) {
      return '...';
    }
    else {
      return usdReturn.toFixed(2);
    }
  }

  async getKPWUsd() {
    let kpwData: any = await this.eos.getBalance('kpw.alaswap', 'kompwndtoken', 'KPW');
    const kpwValue = this.eos.toToken(kpwData.data).value;

    let alaData: any = await this.eos.getBalance('kpw.alaswap', 'alaio.token', 'ALA');
    const alaValue = this.eos.toToken(alaData.data).value;

    let alaUsdValue = await this.alaUSDValue();

    return alaValue * alaUsdValue / kpwValue;
  }

  async usdToKpw(usd) {
    let kpwUsd = await this.getKPWUsd()
    let kpwreturn = usd / kpwUsd;

    if (!kpwreturn) {
      return '';
    }
    else {
      return kpwreturn.toFixed(4);
    }
  }

  async ethToKpw(ethAmount) {
    const exchangeValue = +ethAmount
    const ethToken = {
      symbol: 'ETHX',
      precision: 8,
      contract: 'ethxtoken',
      account: 'eth.alaswap',
    }

    const kpwToken = {
      symbol: 'KPW',
      precision: 4,
      contract: 'kompwndtoken',
      account: 'kpw.alaswap',
    }
    const eth = await this.eos.getBalance(ethToken.account, ethToken.contract, ethToken.symbol)
    let from = +eth.data.slice(0, eth.data.lastIndexOf(" "))

    const alaEth = await this.eos.getBalance(ethToken.account, "alaio.token", "ALA")
    let alaFrom = +alaEth.data.slice(0, alaEth.data.lastIndexOf(" "))

    const alaKpw = await this.eos.getBalance(kpwToken.account, "alaio.token", "ALA")
    let alaTo = +alaKpw.data.slice(0, alaKpw.data.lastIndexOf(" "))

    const kpw = await this.eos.getBalance(kpwToken.account, kpwToken.contract, kpwToken.symbol)
    let to = +kpw.data.slice(0, kpw.data.lastIndexOf(" "))

    let x = this.eos.getRate(from, alaFrom, exchangeValue, undefined, ethToken.precision, 4)     
    let y = this.eos.getRate(alaTo, to, x, undefined, 4, kpwToken.precision)

    let kpwAmount = +y.toFixed(kpwToken.precision)

    const extraFees = this.calculateExtraFees(ethToken.symbol, kpwToken.symbol, ethAmount, kpwAmount);
    if (extraFees && kpwAmount) {
      for (let i = 0; i < extraFees.length; i++) {
        if (extraFees[i].symbol == kpwToken.symbol) {
          kpwAmount = +(kpwAmount - extraFees[i].amount).toFixed(kpwToken.precision);
        }
      }
    }
    return kpwAmount
  }

  

  calculateExtraFees(fromSymbol: string, toSymbol: string, ethAmount, kpwAmount) {
    let extraFees = [];
    let fee: number;        
    
    if (fromSymbol == "OPN" || toSymbol == "OPN") {            
        let amount = toSymbol == "OPN" ? kpwAmount : ethAmount;
        amount = amount ? amount : 0;
        fee = amount * .0009;
        fee = fee < .001 ? .001 : (fee > 5 ? 5 : fee);
        extraFees.push({ amount: this.truncate(fee,4).toFixed(4), symbol: "OPN" });
    }

    if (fromSymbol == "ETHX" || toSymbol == "ETHX") {            
        let amount = toSymbol == "ETHX" ? kpwAmount : ethAmount;
        amount = amount ? amount : 0;
        fee = amount * .01;
        fee = fee < .00000001 ? .00000001 : (fee > .00005 ? .00005 : fee);
        extraFees.push({ amount: this.truncate(fee,8).toFixed(8), symbol: "ETHX" });
    }

    return extraFees;
}

truncate(amount, precision) {
    return Math.floor(amount * Math.pow(10,precision)) / Math.pow(10,precision); // = 
}

  async alaUSDValue() {
    let alaData: any = await this.eos.getBalance('eth.alaswap', 'alaio.token', 'ALA');
    const ethxAlaToken = this.eos.toToken(alaData.data);

    let ethxData: any = await this.eos.getBalance('eth.alaswap', 'ethxtoken', 'ETHX');
    const ethxToken = this.eos.toToken(ethxData.data);

    let ethData: any = (await <Promise<GetRowData>>this.eos.getRows({
      table: 'global',
      contract: 'opn.contract',
      scope: 'opn.contract'
    })).rows[0];

    const ethValue = this.eos.toToken(ethData.eth_price);

    return ethxToken.value / ethxAlaToken.value * ethValue.value;
  }
}
