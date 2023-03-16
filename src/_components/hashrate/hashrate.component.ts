import { Component, Input } from "@angular/core";

@Component({
    selector: 'mine-hashrate',
    templateUrl: 'hashrate.component.html',
    styleUrls: ['hashrate.component.scss']
})
export class HashRateComponent {
    @Input('hashrate') hashrate: number;
    smoothedRate: number = 0;
    TopSpeed: number = 400;
    

    constructor() {
        this.startLoop();
        
    }

    startLoop() {
        
        this.smoothedRate = this.lerp(this.smoothedRate, this.hashrate ? this.hashrate : 0 , this.hashrate ? 0.01 : 0.1);
        
        window.requestAnimationFrame(() => {this.startLoop();})
    }

    get getRatePercent() {
        return this.smoothedRate * 100 / this.getTopSpeed;
    }

    get getTopSpeed() {
        let s = this.smoothedRate > this.TopSpeed - 50 ? this.smoothedRate + 50 : this.TopSpeed;
        
        return s 
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    lerp(v0, v1, t) {
        return v0*(1-t)+v1*t
    }
}