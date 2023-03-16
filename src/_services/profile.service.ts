import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    api: string = environment.endpoint
    httpOpts: any;

    headerImage: string = '';
    user: ProfileData = {
        description: '',
        rank: '',
        imgPath: '',
        audioPath: ''
    }

    freshDeposit: string = ''
    teamDepositRule: string = ''

    //If the rank changed, then we need to reload global leaders
    rankCheck: string = '';

    globalStars: Global[] = []
    globalLeaders: Global[] = []

    leadersLoading: boolean = false;

    criterias: Criteria = {
        sp: {
            deposit: '20,000 KPW',
            team: '1,000,000 KPW'
        },
        sp1: {
            deposit: '1,000,000 KPW',
            team: '12,000,000 KPW'
        },
        sp2: {
            deposit: '2,000,000 KPW',
            team: '40,000,000 KPW'
        },
        sp3: {
            deposit: '3,000,000 KPW',
            team: '80,000,000 KPW'
        },
        sp4: {
            deposit: '4,000,000 KPW',
            team: '160,000,000 KPW'
        },
        sp5: {
            deposit: '5,000,000 KPW',
            team: '320,000,000 KPW'
        },
        sp6: {
            deposit: '6,000,000 KPW',
            team: '650,000,000 KPW'
        }
    }

    date = Date.now();

    constructor(public auth: AuthService, private http: HttpClient) {
        if(this.auth.user) {
            this.initialize()
        }
    }
    
    initialize() {
        this.httpOpts = {
            headers: new HttpHeaders({
                'X-Auth-Token': this.auth.user.username,
                'Mainnet': this.auth.user.mainnet? 'true' : 'false'
            })
        }
    }

    post(endpoint: string, data: any) {
        return new Promise((resolve, reject) => {
            this.http.post(this.api + endpoint, data, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }

    get(endpoint: string) {
        return new Promise((resolve, reject) => {
            this.http.get(this.api + endpoint, this.httpOpts).toPromise().then((response) => {
                resolve(response)
            })
        })
    }

    async getProfile(user: string) {
        let net = this.auth.user.mainnet ? 'mainnet' : 'testnet'
        await this.post('/get-profile', {username: user}).then((res: any) => {
            let profile = res.user;
            if (profile.image) {
                this.user.imgPath = this.api + '/profile_imgs/' + net + '/' + profile.image + '?' + this.date
            }
            else {
                this.user.imgPath = ''
            }
            
            if (profile.audio) {
                this.user.audioPath = this.api + '/audio/' + net + '/' + profile.audio + '?' + this.date
            }
            else {
                this.user.audioPath = ''
            }

            this.user.description = profile.description
            this.user.rank = profile.rank
            if(profile.global_stars){
                this.globalStars = JSON.parse(profile.global_stars)
            }

            //Get deposits
            this.freshDeposit = res.deposit.deposit.toFixed(4) + ' KPW'
            this.teamDepositRule = res.deposit.team_deposit_rule.toFixed(4) + ' KPW'
        })

        //Get global star's audio
        for(let i = 0; i < this.globalStars.length; i++) {
            await this.post('/get-profile', {username: this.globalStars[i].user}).then((res: any) => {
                if(res.user.audio) {
                    this.globalStars[i].audio = this.api + '/audio/' + net + '/' + res.user.audio + '?' + this.date
                }
            })
        }

        //Get global leaders if needed
        if(this.user.rank !== this.rankCheck) {
            this.leadersLoading = true
            await this.getGlobalLeaders(this.user.rank)
            //Get global leader's audio
            for(let i = 0; i < this.globalLeaders.length; i++) {
                await this.post('/get-profile', {username: this.globalLeaders[i].user}).then((res: any) => {
                    if(res.user.audio) {
                        this.globalLeaders[i].audio = this.api + '/audio/' + net + '/' + res.user.audio + '?' + this.date
                    }
                })
            }
            this.leadersLoading = false
            this.rankCheck = this.user.rank
        }
    }

    async getGlobalLeaders(rank: string) {
        await this.post('/get-global-leaders', {rank: rank}).then((res: any) => {
            if(res.globalLeaders) {
                this.globalLeaders = JSON.parse(res.globalLeaders)
            }
        })
    }
}

export interface ProfileData {
    description: string;
    rank: string;
    imgPath: string;
    audioPath: string;
}

export interface Global {
    user: string;
    total: number;
    deposit: number;
    referralDeposit: number;
    audio: string;
}

export interface Rank {
    deposit: string;    //Minimum user deposit
    team: string;       //Minimum team deposit
}

export interface Criteria {
    sp: Rank;
    sp1: Rank;
    sp2: Rank;
    sp3: Rank;
    sp4: Rank;
    sp5: Rank;
    sp6: Rank;
}