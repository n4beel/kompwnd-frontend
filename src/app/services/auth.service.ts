import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

const ecc = require('alaiojs-ecc')
import { Buffer } from 'buffer/';
import * as aladinjs from 'aladinjs'
import * as bip39 from 'bip39'
var HDKey = require('hdkey')
var wif = require('wif')

import { environment } from "../../environments/environment";
const { hyperion, mainnet } = environment;

const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;

@Injectable({
    providedIn: 'root'
})
export class AuthService extends BaseService {
    constructor(
        httpClient: HttpClient,
        private Router: Router,
        ){
            super(httpClient);
    }

    public authenticate(authInfo) {
       return  this.httpPost(`${environment.endpoint}/auth/authenticate`, authInfo);
    } 

    get isAuthenticated() {
        return !!localStorage.getItem('kompwnd-user');
    }

    get user() {
        return JSON.parse(localStorage.getItem('kompwnd-user'));
    }

    

    isAccount(username): Promise<boolean> {
        return (this.httpGet(hyperion + `v2/state/get_account?limit=1&account=${username}`).toPromise()).then((response: any) => {
            if(response.statusCode) {
                return false;
            } else {
                return true;
            }
        }).catch((err) => {
            return false;
        })
    }


    setUser(user: any) {
        localStorage.setItem('kompwnd-user', JSON.stringify(user));
        console.log('SET USER');
    }

    getUserKeys(mnemonicCode : string, password : string){
        return new Promise((res, rej)=> {
            if (!mnemonicCode && !password){
                console.log("NOT SIGNED");
                res(false);
            }
            this.httpPost("https://euapitest.alacritys.net/users/getKeys", {
                mnemonicCode,
                password
            }).subscribe((data)=> {
                res(data)
            }, (err)=> {
                rej(err)
            });
        });
    }

    login(password: string, mnemonic: any, loading? : any) {
        let test = !mainnet;
        return new Promise(async (resolve, reject) => {
            this.getKeys(mnemonic, password).then(async (keys : Keys)=>{
                if (mnemonic.includes(" ")) mnemonic = await this.encryptMnemonic(mnemonic, password)
                    let key = 'EOS' + keys.owner.pub_key.substr(3)
                    this.getUsername(key, test).subscribe(async (accounts : any)=>{
                        console.log(accounts);
                        
                        if(accounts.account_names.length) {
                            let userData = {
                                username: null,
                                mnemonic,
                                mainnet: !test,
                            }
                            userData.username = accounts.account_names[0]
                            resolve(userData)
                        } else {
                            reject("No account found for given owner key")
                        }
                    }, (err) => { reject(err) })
                    
            }, (err) => { reject(err) })
        });
    }

    async validateMnemonic(password: string) {
        let mnemonic = this.user.mnemonic
        mnemonic = await this.decryptMnemonic(mnemonic, password)
        let test = !mainnet;
        return new Promise(async (resolve, reject) => {
            this.getKeys(mnemonic, password).then(async (keys : Keys)=>{
                console.log(keys)
                resolve(keys.active.priv_key)
            }, (err) => { reject(err) })
        });
    }

    getUsername(public_key : string, test : boolean){
        let api
        let httpOptions
        api = hyperion + "v1/history/get_key_accounts"
        httpOptions = {
            headers: new HttpHeaders ({
                'Content-Type': 'text/plain',
                'Accept': '*/*'
            })
        }
        return this.httpPost(api, { public_key }, httpOptions)
    }

    getKeys(mnemonic, password?) {
        return new Promise(async (res, rej) => {
            try {
                if (!mnemonic.includes(' ')) mnemonic = await this.decryptMnemonic(mnemonic, password)
                
                let active = await this.getPublicPrivateKeyFromMnemonic(mnemonic, 0, 'owner')
                let owner = await this.getPublicPrivateKeyFromMnemonic(mnemonic, 1000, '')
                res({ active, owner })
            } catch (err) { console.log("getKeys error:", err); rej(err) }
        });
    }

    async getPublicPrivateKeyFromMnemonic(mnemonic, accno, parent){
        const seed = await bip39.mnemonicToSeedSync(mnemonic);
        const master = await HDKey.fromMasterSeed(Buffer.from(seed))
        const node = await master.derive("m/44'/194'/0'/0/" + accno + "")
        const pub_key = await ecc.PublicKey(node._publicKey).toString()
        const priv_key = await wif.encode(128, node._privateKey, false)
        const respObj : Key = {
            priv_key: priv_key,
            pub_key: pub_key,
            parent
        }
        //console.log("KEYS RECOVERED", respObj);
        return respObj
    }

    async decryptMnemonic (mnemonicCode, password) {
        // this.emit("login-status", "Decrypting mnemonic")
        
        try {
            const ciphertext = mnemonicCode;
            const passwordPromise = new Promise((res, rej) => {
                const pass = password;
                res(pass);
            });
            return passwordPromise
                .then((pass) => this.decryptBackupPhrase(Buffer.from(ciphertext, 'base64'), pass))
                .catch((error) => { return false });
        } catch (error) { throw error; }
    }

    async encryptMnemonic(mnemonic, password){
        const passwordPromise = new Promise((resolve, reject) => {
            let pass = '';
            pass = password;
            resolve(pass);
        });
        
        return passwordPromise
            .then((pass) => this.encryptBackupPhrase(mnemonic, pass))
            .then((cipherTextBuffer) => cipherTextBuffer.toString('base64'))
            .catch((e) => {
                return false
            });
    }

    decryptBackupPhrase(dataBuffer, password) {
        return aladinjs.decryptMnemonic(dataBuffer, password);
    }

    encryptBackupPhrase(plaintextBuffer, password) {
        return aladinjs.encryptMnemonic(plaintextBuffer, password);
    }
}

export interface Keys {
    active: Key,
    owner: Key,
}
export interface Key {
    pub_key : string,
    priv_key : string,
    parent : string
}