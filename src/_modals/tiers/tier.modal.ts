import { Component } from "@angular/core";

@Component({
    templateUrl: 'tier.modal.html',
    styleUrls: ['tier.modal.scss']
})
export class TierModal {
    // tiers = [
    //     {
    //         tier: 0,
    //         req: '< $5,000',
    //         percentage: '100%'
    //     },
    //     {
    //         tier: 1,
    //         req: '> $5,000',
    //         percentage: '120%'
    //     },
    //     {
    //         tier: 2,
    //         req: '> $10,000',
    //         percentage: '140%'
    //     },
    //     {
    //         tier: 3,
    //         req: '> $20,000',
    //         percentage: '160%'
    //     },
    //     {
    //         tier: 4,
    //         req: '> $35,000',
    //         percentage: '180%'
    //     },
    //     {
    //         tier: 5,
    //         req: '> $50,000',
    //         percentage: '200%'
    //     }
    // ]

    tiers = [
        {
            tier: 0,
            req: '< $5,000',
            percentage: '100%'
        },
        {
            tier: 1,
            req: '> $5,000',
            percentage: '100%'
        },
        {
            tier: 2,
            req: '> $10,000',
            percentage: '100%'
        },
        {
            tier: 3,
            req: '> $20,000',
            percentage: '100%'
        },
        {
            tier: 4,
            req: '> $35,000',
            percentage: '100%'
        },
        {
            tier: 5,
            req: '> $50,000',
            percentage: '100%'
        }
    ]
    constructor() { }
}