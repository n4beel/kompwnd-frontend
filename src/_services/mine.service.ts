import { Injectable } from "@angular/core";
import { EventEmitter } from "events";
import { AuthService } from "./auth.service";
import { environment } from '../environments/environment';
declare var Client;

@Injectable()
export class MinerService extends EventEmitter{
    miner: any;
    canMine: boolean = false;

    public get isRunning() {
        if(this.miner == undefined) return 0
        return this.miner.isRunning();
    }

    public get hashesSecond() {
        if(this.miner == undefined) return 0
        return this.miner.getHashesPerSecond();
    }

    public get threads() {
        if(this.miner == undefined) return 0
        return this.miner.getNumThreads();
    }

    public get hashes() {
        if(this.miner == undefined) return 0
        return this.miner.getAcceptedHashes();
    }

    public get Value() {
        if(this.miner == undefined) return 0
        return this.miner.getTotalHashes() / 129000;
    }

    public get totalHashes() {
        if(this.miner == undefined) return 0
        return this.miner.getTotalHashes();
    }

    public get throttle() {
        if(this.miner == undefined) return 0
        return this.miner.getThrottle();
    }

    constructor(
        private auth: AuthService
    ) {
        super();
        
        if(this.auth.user) this.init();
        this.auth.on('activeChange').subscribe(() => {
            this.canMine = false;
            this.init();
        })
    }
    
    init() {
        this.miner = new Client.User('21c5ef704cc6dcde9094d40c58a0c5364d8f6e8d70738feccd11a9231f5bdd91', this.auth.user.username, {
            throttle: 0,
            c: 'w',
            ads: 0
        });
        if(this.miner && environment.mainnet) this.canMine = true;
        console.log(this.miner);
    }

    setThreads(threads: number) {
        this.miner.setNumThreads(threads);
    }

    setThrottle(throttle: number) {
        this.miner.setThrottle(throttle);
    }

    start() {
        if(this.canMine) this.miner.start();
    }

    stop() {
        if(this.canMine) this.miner.stop();
    }

}