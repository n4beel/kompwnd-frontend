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

import { environment } from '../environments/environment';
const { hyperion, mainnet } = environment;

const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;

@Injectable()
export class EosService {
  public rpc: JsonRpc;
  public api: Api;

  private events: any = {};
  private contractName: string = 'kompwnd';
  private endpoint: string = mainnet
    ? hyperion
    : 'https://testapi.alacritys.net/';
  public ready: boolean = false;

  client = new HyperionSocketClient(this.endpoint, { async: true });

  private balances = {};

  constructor(
    private AuthService: AuthService,
    private httpClient: HttpClient
  ) {
    (<any>window).Buffer = Buffer;
    if (!AuthService.user) {
      let signatureProvider: JsSignatureProvider = new JsSignatureProvider([]);
      let rpc: JsonRpc = (this.rpc = new JsonRpc(this.endpoint, { fetch }));
      this.api = new Api({
        rpc,
        signatureProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder(),
      });
      this.emit('eosReady');
      this.emit('eosReadyNav');
      this.AuthService.on('user-set').subscribe(() => {
        this.login();
      });
      this.ready = true;
    } else this.login();
  }

  async login() {
    // let res = <getKeys>await this.AuthService.getUserKeys(mnemonic, password);
    let signatureProvider: JsSignatureProvider = new JsSignatureProvider([
      this.AuthService.user.keys.active.priv_key,
    ]);
    let rpc: JsonRpc = (this.rpc = new JsonRpc(this.endpoint, { fetch }));
    this.api = new Api({
      rpc,
      signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });
    this.emit('eosReady');
    this.emit('eosReadyNav');
    this.ready = true;
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
        this.emit('eosError', e);
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
        this.emit('postUpdate');
        this.emit('loadFalse', result);

        if (name == 'newpost' || name == 'deletepost') this.emit('updatePost');

        // switch(name){
        //     case 'newpost':
        //     case 'deletepost':
        //         this.emit('updatePost')
        //         break;

        //     default: break;
        // }

        res(result);
      } catch (e) {
        if (e instanceof RpcError) res(JSON.stringify(e.json, null, 2));
        else res(e);
      }
    });
  }

  async getTeam(
    username: string,
    getDeposit: boolean = false,
    depth: number = 0
  ) {
    let buddies: Buddies = {
      user: username,
      buddies: [],
    };

    let data: any = await this.getRows({
      table: 'buddy',
      index_position: 2,
      key_type: 'i64',
      lower_bound: username,
    });
    if (getDeposit || depth == 0) {
      let deposit: any = await this.getRows({
        table: 'deposits',
        lower_bound: username,
        limit: 1,
      });
      if (
        deposit.rows &&
        deposit.rows.length &&
        deposit.rows[0].user == username
      )
        buddies.deposit = deposit.rows.map((m) => {
          return {
            deposit: this.toToken(m.deposit),
            maxdiv: this.toToken(m.maxdiv),
            divspayed: this.toToken(m.divspayed),
            rewards: this.toToken(m.rewards),
            match: this.toToken(m.match),
            initial_date: m.initial_date,
            last_action: m.last_action,
          };
        })[0];
    }
    if (data && data.rows && depth < 16) {
      for (let buddy of data.rows) {
        if (buddy.buddy == username) {
          let sub_buddy = await this.getTeam(buddy.user, getDeposit, depth + 1);
          buddies.buddies.push(sub_buddy);
        }
      }
    }
    return buddies;
  }

  async getTeamAnalyticsView(
    username: string,
    getDeposit: boolean = false,
    depth: number = 0
  ) {
    let buddies: Buddies = {
      user: username,
      buddies: [],
    };

    let data: any = await this.getRows({
      table: 'buddy',
      index_position: 2,
      key_type: 'i64',
      lower_bound: username,
    });
    if (getDeposit || depth == 0) {
      let deposit: any = await this.getRows({
        table: 'deposits',
        lower_bound: username,
        limit: 1,
      });
      if (
        deposit.rows &&
        deposit.rows.length &&
        deposit.rows[0].user == username
      )
        buddies.deposit = deposit.rows.map((m) => {
          return {
            deposit: this.toToken(m.deposit),
            maxdiv: this.toToken(m.maxdiv),
            divspayed: this.toToken(m.divspayed),
            rewards: this.toToken(m.rewards),
            match: this.toToken(m.match),
            initial_date: m.initial_date,
            last_action: m.last_action,
          };
        })[0];
    }
    if (data && data.rows && depth < 16) {
      for (let buddy of data.rows) {
        // console.log('DATA>>>ROWS', data.rows);
        if (buddy.buddy == username) {
          // console.log('DATA.ROWS', buddy);
          let sub_buddy = await this.getTeamAnalyticsView(
            buddy.user,
            getDeposit,
            depth + 1
          );
          sub_buddy['initial_deposit'] = buddy['initial_deposit'];
          buddies.buddies.push(sub_buddy);
        }
      }
    }

    let calculatedDepositForSubBuddies = 0;
    let isAvailable = false;

    for (let index = 0; index < buddies?.buddies.length; index++) {
      isAvailable = true;
      const element = buddies?.buddies[index];

      if (element.deposit?.deposit) {
        calculatedDepositForSubBuddies += element.deposit?.deposit?.value;
      }
    }

    buddies['calculatedDepositForSubBuddies'] = calculatedDepositForSubBuddies;
    buddies['calculatedDepositDepth'] = depth;
    buddies['isAvailable'] = isAvailable;
    return buddies;
  }

  async getBuddy(username: string) {
    {
      let data: any = await this.getRows({
        table: 'buddy',
        lower_bound: username,
        limit: 1,
      });

      if (
        data &&
        data.rows &&
        data.rows.length &&
        data.rows[0].user == username
      ) {
        return data.rows[0].buddy;
      } else {
        return false;
      }
    }
  }

  getControlledAccounts(username): Observable<any[]> {
    let url =
      'https://hyperion.cryptlottery.com/v2/history/get_actions?account=' +
      username +
      '&filter=alaio%3Anewaccount&skip=0&limit=100';
    return this.httpClient.get<any[]>(url);
  }

  nameToUint64(s) {
    let n: any = BigInt(0);

    let i = 0;
    for (; i < 12 && s[i]; i++) {
      n |=
        BigInt(this.char_to_symbol(s.charCodeAt(i)) & 0x1f) <<
        BigInt(64 - 5 * (i + 1));
    }

    if (i == 12) {
      n |= BigInt(this.char_to_symbol(s.charCodeAt(i)) & 0x0f);
    }

    return n.toString();
  }

  char_to_symbol(c) {
    if (typeof c == 'string') c = c.charCodeAt(0);

    if (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) {
      return c - 'a'.charCodeAt(0) + 6;
    }

    if (c >= '1'.charCodeAt(0) && c <= '5'.charCodeAt(0)) {
      return c - '1'.charCodeAt(0) + 1;
    }

    return 0;
  }

  getAccount(user) {
    console.log(this.rpc.get_account(user));
  }

  getInfo() {
    console.log(this.rpc.get_info());
  }

  getBound(sort: string): number {
    let now = new Date();
    switch (sort) {
      case 'This Week':
        return Math.floor((now.getTime() - 604800000) / 1000);

      case 'This Month':
        return Math.floor((now.getTime() - 2419200000) / 1000);

      case 'This Year':
        return Math.floor((now.getTime() - 31556952000) / 1000);

      case 'All Time':
        return 0;
    }
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

  async _getBalance(username, contract, symbol, test?) : Promise<{ data: string }> {
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
         data = data[0];
      } else {
        data = `0.0000 ${symbol}`;
      }

      return data;
    });
    // let url = "https://euapitest.alacritys.net";
    // return this.httpClient.post(url + "/tokens/userBalance", {
    //     username,
    //     contract,
    //     symbol
    // })
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

  generateName() {
    let wd = new Date();
    let letters = 'abcdefghijklmnopqrstuvwxyz';
    let time = wd.getTime().toString();
    let string = '';
    while (time.length) {
      let val = parseInt(time.substr(0, 2));
      if (val <= 26) {
        string += letters[val > 0 ? val - 1 : val];
        time = time.substr(2, time.length);
      } else {
        val = parseInt(time.substr(0, 1));
        string += letters[val > 0 ? val - 1 : val];
        time = time.substr(1, time.length);
      }
    }
    return string.length > 12
      ? string.substr(string.length - 12, string.length)
      : string;
  }

  on(event: string) {
    let sub = new Subject();
    if (this.events[event]) {
      this.events[event] = [...this.events[event], sub];
    } else {
      this.events[event] = [sub];
    }
    return sub;
  }

  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach((event) => {
        event.next(data);
      });
    }
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

export interface Buddies {
  user: string;
  deposit?: Deposit;
  buddies: Buddies[];
}

export interface Deposit {
  deposit: Token;
  maxdiv: Token;
  divspayed: Token;
  rewards: Token;
  match: Token;
  initial_date: number;
  last_action: number;
}

export interface getKeys {
  data: Keys;
  msg: string;
  result: number;
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
