import { Injectable } from '@angular/core';
import { EosService, GetRowData, Token } from './eos.service';
import { SocketService } from './socket.service';
import { environment } from "../environments/environment";
const { mainnet } = environment;
const maxTTL = 30000;

@Injectable({
  providedIn: 'root'
})
export class ConversionService {
  time1 = 0;
  time2 = 0;
  kpwValue: number;
  alaValue: number;
  ala_usd_value: number;

  empty: Token = {
    value: 0,
    precision: 1,
    symbol: ''
  }

  kpwAlaToken: Token = this.empty;
  kpwToken: Token = this.empty;
  ethxAlaToken: Token = this.empty;
  ethxToken: Token = this.empty;
  ethValue: Token = this.empty;
  opnToken: Token = this.empty;
  opnAlaToken: Token = this.empty;
  gvnValue: number;
  gvnToken: Token = this.empty;
  gvnAlaToken: Token = this.empty;

  ttl: number = new Date().getTime();

  constructor(private eos: EosService, private socket: SocketService) { 
    socket.io.on('conversion data', (data) => {
      this.kpwAlaToken = data.kpwAlaToken;
      this.kpwToken = data.kpwToken;
      this.ethxAlaToken = data.ethxAlaToken;
      this.ethxToken = data.ethxToken;
      this.ethValue = data.ethValue;
      this.opnToken = data.opnToken;
      this.opnAlaToken = data.opnAlaToken;
      this.gvnValue = data.gvnValue;
      this.gvnToken = data.gvnToken;
      this.gvnAlaToken = data.gvnAlaToken;
      //console.log("socket data ", data)
    })
  }

  async kpwtousd(kpw: number): Promise<string> {
    let kpwusd = await this.getKPWUsd();
    let usdReturn = +(kpw * kpwusd);

    if(Number.isNaN(usdReturn)) {
      return '...';
    }
    else {
      return '$ ' + usdReturn.toFixed(2) + ' USD';
    }
  }

  async getKPWUsd(): Promise<number> {
    let ala_usd = await this.alaUSDValue();
    return (this.kpwAlaToken.value / this.kpwToken.value * ala_usd);
  }

  async usdtokpw(usd: number) {
    let cur = new Date().getTime();
    let usdkpw: number;
    let kpwreturn: number;

    // Detects if function has been called in under 10 seconds
    if(cur > this.time2 + 10000) {
      let alaToken: Token;
      let kpwToken: Token;
      let kpwData: any = await this.eos.getBalance('kpw.alaswap', 'kompwndtoken', 'KPW');
      kpwToken = this.eos.toToken(kpwData.data);
      let alaData: any = await this.eos.getBalance('kpw.alaswap', 'alaio.token', 'ALA');
      alaToken = this.eos.toToken(alaData.data);
      let ala_usd = await this.alaUSDValue();

      this.kpwValue = kpwToken.value;
      this.alaValue = alaToken.value;
      this.ala_usd_value = ala_usd;
      usdkpw = alaToken.value * ala_usd / kpwToken.value;
      kpwreturn = usd / usdkpw;
    }
    else {
      usdkpw = this.alaValue * this.ala_usd_value / this.kpwValue;
      kpwreturn = usd / usdkpw;
    }

    this.time2 = cur;
    return kpwreturn.toFixed(4) + ' KPW';
  }

  async alaUSDValue() {
    let cur = new Date().getTime();
    if(cur - this.ttl > maxTTL){
      //ETH
      let alaData: any = await this.eos.getBalance('eth.alaswap', 'alaio.token', 'ALA');
      this.ethxAlaToken = this.eos.toToken(alaData.data);
      let ethxData: any = await this.eos.getBalance('eth.alaswap', 'ethxtoken', 'ETHX');
      this.ethxToken = this.eos.toToken(ethxData.data);
      let ethData: any = (await <Promise<GetRowData>>this.eos.getRows({
          table: 'global',
          contract: 'opn.contract',
          scope: 'opn.contract'
      })).rows[0];
    
      this.ethValue = this.eos.toToken(ethData.eth_price);

      //OPN
      let opnExchangeContract = mainnet ? 'opn.alaswap' : 'apn.alaswap';
      let opnAlaData: any = await this.eos.getBalance(opnExchangeContract, 'alaio.token', 'ALA');
      this.opnAlaToken = this.eos.toToken(opnAlaData.data);
      let opnData: any = await this.eos.getBalance(opnExchangeContract, 'opn', 'OPN');
      this.opnToken = this.eos.toToken(opnData.data);

      //GVN
      let gvnData: any = (await <Promise<GetRowData>>this.eos.getRows({
        table: 'stat',
        contract: 'gvn.token',
        scope: 'GVN'
      })).rows[0];
      this.gvnValue = Math.floor(gvnData.supply.split(" ")[0]) + 1;
      let gvnAlaData = await this.eos.getBalance('gvn.alaswap', 'alaio.token', 'ALA');
      this.gvnAlaToken = this.eos.toToken(gvnAlaData.data);
      let gvnData2 = await this.eos.getBalance('gvn.alaswap', 'gvn.token', 'GVN');
      this.gvnToken = this.eos.toToken(gvnData2.data);
    }

    this.ttl = cur;

    let alaValueEthx = this.ethxToken.value / this.ethxAlaToken.value * this.ethValue.value;
    let ethxWeight = this.ethxToken.value * this.ethValue.value;
    let alaValueOpn = this.opnToken.value / this.opnAlaToken.value;
    let opnWeight = this.opnToken.value;
    let alaValueGvn = this.gvnToken.value / this.gvnAlaToken.value * this.gvnValue;
    let gvnWeight = this.gvnToken.value * this.gvnValue;

    //Old ALA Formula
    let ala_usd_value = alaValueEthx;

    //New ALA Formula
    // let ala_usd_value = (alaValueEthx * ethxWeight + alaValueOpn * opnWeight + alaValueGvn * gvnWeight) / (ethxWeight + opnWeight + gvnWeight);
    // console.log("ala usd ", ala_usd_value);
    return ala_usd_value;
  }

  // Duplicate functions for KPW/USD conversion for shoppingrite
  async _usdtokpw(usd: number) {
    let cur = new Date().getTime();
    let usdkpw: number;
    let kpwreturn: number;
    let kpwReturnString: Token;
    // Detects if function has been called in under 10 seconds
    // debugger
    if(cur > this.time2 + 10000) {
      let alaToken: Token;
      let kpwToken: Token;
      let kpwData: any = await this.eos.getBalance('kpw.alaswap', 'kompwndtoken', 'KPW');
      kpwToken = this.eos.toToken(kpwData.data);
      let alaData: any = await this.eos.getBalance('kpw.alaswap', 'alaio.token', 'ALA');
      alaToken = this.eos.toToken(alaData.data);
      let ala_usd = await this._alaUSDValue();

      this.kpwValue = kpwToken.value;
      this.alaValue = alaToken.value;
      this.ala_usd_value = ala_usd;
      usdkpw = alaToken.value * ala_usd / kpwToken.value;
      kpwreturn = usd / usdkpw;
    }
    else {
      usdkpw = this.alaValue * this.ala_usd_value / this.kpwValue;
      kpwreturn = usd / usdkpw;
    }

    this.time2 = cur;
    const beforeConversion = kpwreturn.toFixed(4) + ' KPW';
    kpwReturnString = this.eos.toToken(beforeConversion.toString());
    
    return kpwReturnString;
  }

  async _alaUSDValue() {
    let cur = new Date().getTime();
    // if(cur - this.ttl > maxTTL){
      //ETH
      let alaData: any = await this.eos.getBalance('eth.alaswap', 'alaio.token', 'ALA');
      this.ethxAlaToken = this.eos.toToken(alaData.data);
      let ethxData: any = await this.eos.getBalance('eth.alaswap', 'ethxtoken', 'ETHX');
      this.ethxToken = this.eos.toToken(ethxData.data);
      let ethData: any = (await <Promise<GetRowData>>this.eos.getRows({
          table: 'global',
          contract: 'opn.contract',
          scope: 'opn.contract'
      })).rows[0];
    
      this.ethValue = this.eos.toToken(ethData.eth_price);

      //OPN
      let opnExchangeContract = mainnet ? 'opn.alaswap' : 'apn.alaswap';
      let opnAlaData: any = await this.eos.getBalance(opnExchangeContract, 'alaio.token', 'ALA');
      this.opnAlaToken = this.eos.toToken(opnAlaData.data);
      let opnData: any = await this.eos.getBalance(opnExchangeContract, 'opn', 'OPN');
      this.opnToken = this.eos.toToken(opnData.data);

      //GVN
      let gvnData: any = (await <Promise<GetRowData>>this.eos.getRows({
        table: 'stat',
        contract: 'gvn.token',
        scope: 'GVN'
      })).rows[0];
      this.gvnValue = Math.floor(gvnData.supply.split(" ")[0]) + 1;
      let gvnAlaData = await this.eos.getBalance('gvn.alaswap', 'alaio.token', 'ALA');
      this.gvnAlaToken = this.eos.toToken(gvnAlaData.data);
      let gvnData2 = await this.eos.getBalance('gvn.alaswap', 'gvn.token', 'GVN');
      this.gvnToken = this.eos.toToken(gvnData2.data);
    // }

    this.ttl = cur;

    let alaValueEthx = this.ethxToken.value / this.ethxAlaToken.value * this.ethValue.value;
    let ethxWeight = this.ethxToken.value * this.ethValue.value;
    let alaValueOpn = this.opnToken.value / this.opnAlaToken.value;
    let opnWeight = this.opnToken.value;
    let alaValueGvn = this.gvnToken.value / this.gvnAlaToken.value * this.gvnValue;
    let gvnWeight = this.gvnToken.value * this.gvnValue;

    //Old ALA Formula
    let ala_usd_value = alaValueEthx;
    
    //New ALA Formula
    // let ala_usd_value = (alaValueEthx * ethxWeight + alaValueOpn * opnWeight + alaValueGvn * gvnWeight) / (ethxWeight + opnWeight + gvnWeight);
    return ala_usd_value;
  }
}
