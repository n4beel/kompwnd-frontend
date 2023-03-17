import { Injectable } from '@angular/core';
import { JsonRpc, RpcError, Api } from 'alaiojs';
import { JsSignatureProvider } from 'alaiojs/dist/alaiojs-jssig';
import { TextDecoder, TextEncoder } from 'text-encoding';
import { Buffer } from 'buffer/';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import {
  HttpClient,
  HttpEvent,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';

import { environment } from '../../environments/environment';
const { hyperion, mainnet } = environment;

const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;


@Injectable({
  providedIn: 'root'
})
export class EosService {
  public rpc: JsonRpc;
  public api: Api;

  private events: any = {};
  private contractName: string = 'kompwnd';
  private endpoint: string = hyperion
  public ready: boolean = false;

  client = new HyperionSocketClient(this.endpoint, { async: true });

  private balances = {};

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {
    (<any>window).Buffer = Buffer;
    this.initialize();
  }

  async initialize(activePrivateKey = null) {
    const key = activePrivateKey ? [activePrivateKey] : []
    let signatureProvider: JsSignatureProvider = new JsSignatureProvider(key);
    let rpc: JsonRpc = (this.rpc = new JsonRpc(this.endpoint, { fetch }));
    this.api = new Api({
      rpc,
      signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });
  }

  getRows(options) {
    return new Promise(async (res, rej) => {
      let defaults = {
        scope: this.contractName,
        contract: this.contractName,
        limit: 9999,
        index: 0,
        reverse: false,
      };
      ['scope', 'contract', 'limit', 'index', 'reverse'].forEach((key) => {
        if (!options.hasOwnProperty(key)) options[key] = defaults[key];
      });
      try {
        let result: GetRowData = await this.rpc.get_table_rows({
          json: true,
          code: options.contract,
          scope: options.scope ? options.scope : options.contract,
          table: options.table,
          index_position: options.index_position,
          limit: options.limit,
          lower_bound: options.lower_bound,
          upper_bound: options.upper_bound,
          key_type: options.key_type,
          reverse: options.reverse,
        });
        res(result);
      } catch (e) {
        console.log('\nCaught exception on get_table_rows: ', e, options);
        if (e instanceof RpcError) res(JSON.stringify(e.json, null, 2));
      }
    });
  }

  pushTransaction(name, actor, data, acct?) {
    let account;
    if (acct) account = acct;
    else account = this.contractName;

    return new Promise(async (res) => {
      try {
        const result = await this.api.transact(
          {
            actions: [
              {
                account: account,
                name: name,
                authorization: [
                  {
                    actor: actor,
                    permission: 'active',
                  },
                ],
                data: data,
              },
            ],
          },
          {
            blocksBehind: 3,
            expireSeconds: 3600,
          }
        );
        res(result);
      } catch (e) {
        if (e instanceof RpcError) res(JSON.stringify(e.json, null, 2));
        else res(e);
      }
    });
  }


  getBalance(username, contract, symbol, test?): Promise<{ data: string }> {
    return new Promise(async (res) => {
      let data: any = await this.httpClient
        .get(hyperion + 'v1/chain/get_currency_balance', {
          params: {
            code: contract,
            account: username,
            symbol,
          },
        })
        .toPromise();

    
      if (data.length) {
         res({ data: data[0] });
      } else {
        res({ data: `0.0000 ${symbol}` });
      }
    });
  }

  getRate(from : number, to : number, quantity : number, fee : number = 0.003, fromPrecision: number = 4, toPrecision: number = 4){
    let fromBefore = from;
    let fromAfter = from + quantity;

    let providerFee = Math.max(quantity * fee, 1/Math.pow(10,fromPrecision));
    
    let providerFeeTruncated = this.truncate(providerFee, fromPrecision);

    let invariant = fromBefore * to;
    let newTo = invariant / (fromAfter - providerFeeTruncated);

    let rate = Math.max(0,to - newTo);
    rate = rate + 0.0000000001; //just in case js round error
    
    var truncatedRate = this.truncate(rate, toPrecision);
    return truncatedRate;
}

truncate(amount, precision) {
    return Math.floor(amount * Math.pow(10,precision)) / Math.pow(10,precision); // = 
}

  toToken(tok: string) {
    let ValSym = tok.split(' ');
    let precString = ValSym[0].split('.')[1];
    return <Token>{
      value: parseFloat(ValSym[0]),
      precision: precString ? precString.length : 4,
      symbol: ValSym[1],
    };
  }

  toString(tok: Token) {
    return Number(tok.value).toFixed(tok.precision) + ` ${tok.symbol}`;
  }

}

export interface Token {
  value: number;
  precision: number;
  symbol: string;
}

export interface GetRowData {
  rows: any[];
  more: boolean;
  next_key: string;
}

export interface Keys {
  active: Key;
  owner: Key;
}
export interface Key {
  pub_key: string;
  priv_key: string;
  parent: string;
}
