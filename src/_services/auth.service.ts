import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { USER_KEY, PAGE_KEY } from "../_constants/constants";
import { Subject } from 'rxjs';

const ecc = require('alaiojs-ecc')
import { Buffer } from 'buffer/';
import * as aladinjs from 'aladinjs'
import * as bip39 from 'bip39'
var HDKey = require('hdkey')
var wif = require('wif')

import { environment } from "../environments/environment";
const { hyperion, mainnet } = environment;

const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;

@Injectable()
export class AuthService extends BaseService {
    private events : any = {};
    public referral: string;

    constructor(
        httpClient: HttpClient,
        private Router: Router,
        private route: ActivatedRoute
        ){
            super(httpClient);

            this.route.queryParams.subscribe(async params => {
                let username = params['referral'];
                if(username) {
                  let isUser = await this.isAccount(username);
                  console.log('IS USER: ', isUser);
                  
                  if(isUser) {
                    this.referral = username;
                    console.log('emit ref');
                    this.emit('set-ref', true); 
                  }
                }
              })
            if(this.user) this.emit('user-set');
    }

    get isAuthenticated() {
        return !!localStorage.getItem(USER_KEY);
    }

    get user() {
        return JSON.parse(localStorage.getItem(USER_KEY));
    }

    get pages() {
        return JSON.parse(localStorage.getItem(USER_KEY));
    }

    get active(){
        let pages = this.pages

        // return the active Page if active
        if (this.pages)
            for (let i = 0; i < pages.length; i++)
                if (pages[i].active) return pages[i]
        
        // otherwise return active user
        return this.user;
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

    isPage(user){
        if (this.active)
            if (this.pages)
                for (let i = 0; i < this.pages.length; i++)
                    if (this.pages[i].username == user && this.pages[i].isPage) 
                        return true

        return false;
    }

    setActive(account : any){
        this.emit('activeChange', {username: account.username, isPage: account.isPage});
        this.emit('activeChangeNav', {username: account.username, isPage: account.isPage});
        this.emit('socketChange', {newUser: account.username, oldUser: this.active.username});

        let pages = this.pages
        let user = this.user
        
        if (account.isPage){
            for (let i = 0; i < pages.length; i++){
                if (pages[i].username == account.username){
                    pages[i].active = true;
                }
                else {
                    pages[i].active = false;
                }
            }
            user.active = false;
            this.setUser(user);
            this.setPage(pages);
        }
        else {
            user.active = true;
            for (let i = 0; i < pages.length; i++){
                pages[i].active = false;
            }
            this.setUser(user);
            this.setPage(pages);
        }
    }

    setUser(user: any) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        console.log('SET USER');
        
        this.emit('user-set');
    }

    setPage(pages : any){
        localStorage.setItem(PAGE_KEY, JSON.stringify(pages));
    }

    addPage(page: any){
        let pages = this.pages
        pages.push(page)
        this.setPage(pages)
    }

    // removePage(page : any){
    //     console.log(page);
    //     console.log(this.pages);
        
        
    //     let pages = this.pages
    //     for (let i = 0; i < pages.length; i++){
    //         if (pages[i].username == page)
    //             console.log(pages[i]);
                
    //             // delete pages[i]
    //     }
    //     // this.setPage(pages)
    // }

    public async callAPI(action: string, data: any) {
        return new Promise((res, rej) => {
            this.httpPost("https://euapitest.alacritys.net/users/login/" + action, data)
            .subscribe((data: any) => { res(data); }, (error)=> { rej(error.error) })
        })
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

    // login(email: string, password: string, mnemonic_code: string) {        
    //     return this.httpPost("https://euapitest.alacritys.net/users/login", {
    //         email,
    //         password,
    //         mnemonic_code
    //     }) 
    // }

    login(password: string, mnemonic: any, loading? : any) {
        let test = !mainnet;

        return new Promise(async (resolve, reject) => {
            this.getKeys(mnemonic, password).then(async (keys : Keys)=>{
                if (mnemonic.includes(" ")) mnemonic = await this.encryptMnemonic(mnemonic, password)

                this.emit("login-status", "Generating Gaia config")
                    let key = 'EOS' + keys.owner.pub_key.substr(3)
                    this.getUsername(key, test).subscribe(async (accounts : any)=>{
                        console.log(accounts);
                        
                        if(accounts.account_names.length) {
                            let userData = {
                                username: null,
                                mnemonic,
                                password,
                                mainnet: !test,
                                keys,
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

    getUsername(public_key : string, test : boolean){
        this.emit("login-status", "Getting username from key")

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
        this.emit("login-status", "Getting keys from mnemonic")

        return new Promise(async (res, rej) => {
            try {
                if (!mnemonic.includes(' ')) mnemonic = await this.decryptMnemonic(mnemonic, password)
                
                let active = await this.getPublicPrivateKeyFromMnemonic(mnemonic, 0, 'owner')
                let owner = await this.getPublicPrivateKeyFromMnemonic(mnemonic, 1000, '')
                // console.log("ACTIVE KEY", active);
                // console.log("OWNER KEY", owner);
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
        this.emit("login-status", "Decrypting mnemonic")
        
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
        this.emit("login-status", "Encrypting mnemonic")

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

    logout() {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(PAGE_KEY);
        this.Router.navigateByUrl('/kompwnd');
        this.emit('logout', {});
    }

    on(event : string) {
        let sub = new Subject();
        if(this.events[event]) {
            this.events[event] = [ ...this.events[event] , sub];
        } else {
            this.events[event] = [sub];
        }
        console.log(this.events);
        
        return sub;
    }

    emit(event : string, data?: any) {
        console.log(this.events);
        
        if (this.events[event]){
            console.log(this.events);
            
            this.events[event].forEach((event) => {
                console.log(event);
                
                event.next(data);
            })
        }
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