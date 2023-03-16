import { AfterViewInit, Component, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { TierModal } from "src/_modals/tiers/tier.modal";
import { AuthService } from "src/_services/auth.service";
import { EosService, GetRowData, Token } from "src/_services/eos.service";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { ConversionService } from "src/_services/conversion.service";
import { SocketService } from "src/_services/socket.service";
import { ProfileService } from "src/_services/profile.service";

const DIV_DAYS: number = 200;

@Component({
  templateUrl: 'kompwnd.page.html',
  styleUrls: ['kompwnd.page.scss'],
})
export class KompwndPage implements AfterViewInit, OnDestroy {
  loaded: boolean = false;
  kpwAvailable: Token;

  tier: number = 0;
  dailyEarning: string;
  dailyEarningText: string;
  earning: any;

  showMatchData: boolean = false;
  matchData: any[];

  buddy: string;
  setBuddy: string;
  refBuddy: boolean = false;
  shareFriend: string;
  shareQuantity: number = 0;

  claimDisable: boolean = false;
  rollDisable: boolean = false;
  depositDisable: boolean = false;
  usdDeposit = 0;
  tokpwDeposit: number;
  divs: Token;
  deposit: Token;
  divsPayed: Token;
  oldRewards: Token;
  rewards: Token;
  oldMatch: Token;
  match: Token;
  maxPay: Token;
  team = {
    direct: 0,
    total: 0,
  };
  allTeam: any[] = [];
  last_action: number = 0;

  kpwValue: number = 0;

  //Conversion
  convertedDivs: string = '';
  convertedDailyEarning: string = '';
  convertedDeposits: string = '';
  convertedDivsPayed: string = '';
  convertedRewards: string = '';
  convertedMatch: string = '';
  convertedMaxPay: string = '';

  get throttleActive(): boolean {
    return this.kpwValue !== 0 && this.kpwValue < 0.00999999;
  }

  get dynamicFee(): number {
    let min_fee = 0.05;
    let max_fee = 0.9;
    let fee_max = max_fee - min_fee;
    let fee_val =
      min_fee + (1 - this.kpwValue / 0.00999999) * fee_max + 0.000001;
    return Math.round(fee_val * 10000) / 100;
  }

  get depositBuff(): number {
    let mult = 0.5 * (1 - this.kpwValue / 0.00999999) + 0.0000001;
    return Math.round(mult * 10000) / 100;
  }

  get trueDeposit(): string {
    let value = 0;
    if (this.tokpwDeposit != null && this.tokpwDeposit > 0) {
      value = this.tokpwDeposit;
    }
    return value.toFixed(2);
  }

  get maxShare(): number {
    if (
      this.rewards &&
      this.divs &&
      this.rewards.value != null &&
      this.divs.value != null
    ) {
      return this.rewards.value + this.divs.value;
    } else return 0;
  }

    message: string;
    messageType: 'error' | 'success';
    messageTimout: NodeJS.Timeout;

    availableInterval;
    depositInterval;

    matches: Match[] = [
        { generation:  2, percentage: 0.10 },
        { generation:  3, percentage: 0.10 },
        { generation:  4, percentage: 0.10 },
        { generation:  5, percentage: 0.10 },
        { generation:  6, percentage: 0.08 },
        { generation:  7, percentage: 0.08 },
        { generation:  8, percentage: 0.08 },
        { generation:  9, percentage: 0.08 },
        { generation: 10, percentage: 0.08 },
        { generation: 11, percentage: 0.05 },
        { generation: 12, percentage: 0.05 },
        { generation: 13, percentage: 0.05 },
        { generation: 14, percentage: 0.05 },
        { generation: 15, percentage: 0.05 }
    ]

    tiers: Tier[] = [
        { value:  1000, percentage: 1 },
        { value:  5000, percentage: 1.2 },
        { value: 10000, percentage: 1.4 },
        { value: 20000, percentage: 1.6 },
        { value: 35000, percentage: 1.8 },
        { value: 40000, percentage: 2 }
    ]

    rowsToShow: number | number[] = null;
    varRows: any[] = [];
    multi: chartData[] = [];
    chartsData: any = {};
    xTicks: string[];
    // view: any[] = [null, 400];

    piechart: pieData[] = [];

    // options
    legend: boolean = true;
    showLabels: boolean = true;
    animations: boolean = true;
    yAxis: boolean = true;
    xAxis: boolean = true;
    showXAxisLabel: boolean = false;
    yAxisLabel: string = 'Value';
    autoScale: boolean = true;
    timeline: boolean = true;

    colorScheme = {
        domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
    };

    onSelect(data): void {
        console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    }
    
    onActivate(data): void {
        console.log('Activate', JSON.parse(JSON.stringify(data)));
    }
    
    onDeactivate(data): void {
        console.log('Deactivate', JSON.parse(JSON.stringify(data)));
    }


    constructor(
      private eos: EosService,
      private auth: AuthService,
      private dialog: MatDialog,
      private http: HttpClient,
      private conversion: ConversionService,
      private socket: SocketService,
      private profile: ProfileService
    ) {
      if (this.eos.ready) {
        this.init();
      }
      this.eos.on('eosReady').subscribe(() => {
        this.init();
      });
  
      this.auth.on('logout').subscribe(() => {
        ['divs', 'deposit', 'divsPayed', 'rewards', 'maxPay'].forEach((key) => {
          this[key] = null;
        });
        this.team = {
          direct: 0,
          total: 0,
        };
        this.buddy = null;
        clearInterval(this.availableInterval);
        clearInterval(this.depositInterval);
        this.kpwAvailable = null;
      });
    }

  ngAfterViewInit() {}

  ngOnDestroy() {
    clearInterval(this.availableInterval);
    clearInterval(this.depositInterval);
  }

  async init() {
    if (this.auth.user) {
      console.log('ADD BUDDY TEST');

      let buddy = await this.eos.getBuddy(this.auth.user.username);
      if (buddy) {
        this.buddy = buddy;

        let data: any = { username: this.auth.user.username, buddy: buddy };
        if (!environment.mainnet) data.testnet = true;
      } else {
        if (this.auth.referral) {
          this.refBuddy = true;
          this.setBuddy = this.auth.referral;
        } else {
          console.log('set ref buddy');
          setTimeout(() => {
            console.log('set ref buddy', this.auth.referral);
          }, 1000);
          this.auth.on('set-ref').subscribe((d) => {
            console.log('set ref buddy', this.auth.referral);
            this.refBuddy = true;
            this.setBuddy = this.auth.referral;
          });
        }
      }
      console.log(this.buddy);

      this.getVars().then(() => {
        this.showRows();
      });

      await this.getDeposit();

      this.eos
        .getRows({
          table: 'match',
          scope: this.auth.user.username,
        })
        .then((data: any) => {
          if (data.rows && data.rows.length) {
            this.matchData = data.rows;
          }
        });

      let team = await this.eos.getTeam(this.auth.user.username);
      this.team.direct = team.buddies.length;

      this.allTeam = this.getBuddies(team, true);
      this.team.total = this.allTeam.length;
      console.log('ALL TEAM: ', this.allTeam);

      this.eos.on('migration').subscribe(() => {
        this.eos
          .getBalance(this.auth.user.username, 'kompwndtoken', 'KPW')
          .then((data: any) => {
            this.kpwAvailable = this.eos.toToken(data.data);
          });
      });

      this.eos
        .getBalance(this.auth.user.username, 'kompwndtoken', 'KPW')
        .then((data: any) => {
          this.kpwAvailable = this.eos.toToken(data.data);
          this.loaded = true;
        });
    } else {
      if (this.auth.referral) {
        this.refBuddy = true;
        this.setBuddy = this.auth.referral;
      } else {
        console.log('set ref buddy');
        setTimeout(() => {
          console.log('set ref buddy', this.auth.referral);
        }, 1000);
        this.auth.on('set-ref').subscribe((d) => {
          console.log('set ref buddy', this.auth.referral);
          this.refBuddy = true;
          this.setBuddy = this.auth.referral;
        });
      }
    }
  }

  async getDeposit() {
    await this.eos
      .getRows({
        table: 'deposits',
        index: 'secondary',
        lower_bound: this.auth.user.username,
      })
      .then(async (data: any) => {
        if (data.rows && data.rows.length) {
          let row = data.rows[0];
          if (row.user == this.auth.user.username) {
            this.deposit = this.eos.toToken(row.deposit);
            this.divsPayed = this.eos.toToken(row.divspayed);
            this.maxPay = this.eos.toToken(row.maxdiv);
            this.rewards = this.oldRewards = this.eos.toToken(row.rewards);
            this.match = this.oldMatch = this.eos.toToken(row.match);
            this.last_action = row.last_action;
            this.earning = await this.eos.getRows({table: 'earningrate', lower_bound: this.auth.user.username})
            this.calcAvailable();
            this.calcAvailable(true);
            this.availableInterval = setInterval(() => {
              this.calcAvailable();
            }, 1000);
            this.availableInterval = setInterval(() => {
              this.calcAvailable(true);
            }, 1000);
          } else {
            let zero = '0.0000 KPW';
            this.deposit = this.eos.toToken(zero);
            this.divsPayed = this.eos.toToken(zero);
            this.maxPay = this.eos.toToken(zero);
            this.rewards = this.oldRewards = this.eos.toToken(zero);
            this.match = this.oldMatch = this.eos.toToken(zero);
            this.divs = this.eos.toToken(zero);
            this.last_action = 0;
          }

          //console.log("Rows ", data);
          this.piechart = [
            {
              name: 'Deposit',
              value: this.deposit.value,
            },
            {
              name: 'Dividends',
              value: this.divsPayed.value,
            },
            {
              name: 'Max Dividends',
              value: this.maxPay.value,
            },
            {
              name: 'Direct Rewards',
              value: this.rewards.value,
            },
            {
              name: 'Match Rewards',
              value: this.match.value,
            },
          ];
        }
      });

    this.usdConversion();
    this.depositInterval = setInterval(() => {
      this.usdConversion();
    }, 1000);
  }

  async usdConversion() {
    //Check the symbol for proper conversion
    if (this.deposit.symbol == 'KPW') {
      // this.conversion.kpwtousd(this.deposit.value).then((data) => this.convertedDeposits = data);
      // this.conversion.kpwtousd(this.divsPayed.value).then((data) => this.convertedDivsPayed = data);
      // this.conversion.kpwtousd(this.maxPay.value).then((data) => this.convertedMaxPay = data);
      this.conversion
        .kpwtousd(this.rewards.value)
        .then((data) => (this.convertedRewards = data));
      this.conversion
        .kpwtousd(this.match.value)
        .then((data) => (this.convertedMatch = data));
    } else if (this.deposit.symbol == 'USD') {
      // this.conversion.usdtokpw(this.deposit.value).then((data) => this.convertedDeposits = data);
      // this.conversion.usdtokpw(this.divsPayed.value).then((data) => this.convertedDivsPayed = data);
      // this.conversion.usdtokpw(this.maxPay.value).then((data) => this.convertedMaxPay = data);
      this.conversion
        .usdtokpw(this.rewards.value)
        .then((data) => (this.convertedRewards = data));
      this.conversion
        .usdtokpw(this.match.value)
        .then((data) => (this.convertedMatch = data));
    }
  }

  async onConvert(ev: Event) {
    let kpwusd = await this.conversion.getKPWUsd();
    this.usdDeposit = +(this.tokpwDeposit * kpwusd).toFixed(4);
  }

  async getKPWValue() {
    let kpwstring = await this.conversion.usdtokpw(1.0);
    let kpwdollar = +kpwstring.substring(2, kpwstring.length - 3);

    return 1.0 / kpwdollar;
  }

  onDeposit() {
    this.depositDisable = true;
    if (this.auth.user) {
      if (!this.tokpwDeposit || this.tokpwDeposit <= 0) {
        this.showMessage('Deposit must be positive amount', true);
        this.depositDisable = false;
        return;
      }

      if (this.buddy == null) {
        this.showMessage('You must set a buddy first', true);
        this.depositDisable = false;
        return;
      }

      let quantity = Number(this.tokpwDeposit).toFixed(4) + ' KPW';
      this.eos
        .pushTransaction(
          'transfer',
          this.auth.user.username,
          {
            from: this.auth.user.username,
            to: 'kompwnd',
            quantity,
            memo: 'Kompwnd Deposit',
          },
          'kompwndtoken'
        )
        .then((data: any) => {
          if (data.transaction_id) {
            this.tokpwDeposit = null;

            //Insert deposit into database
            this.profile.post('/add-deposit', {
              deposit: quantity
          }).then((res: any) => console.log('Deposit Successful'))

            this.showMessage('Deposit Successful');
            this.init();
            this.eos
              .getBalance(this.auth.user.username, 'kompwndtoken', 'KPW')
              .then((data: any) => {
                this.kpwAvailable = this.eos.toToken(data.data);
                this.depositDisable = false;
              });
            this.usdDeposit = 0;
            console.log(data);
          } else {
            console.log(data);

            data = JSON.parse(data);
            let message = this.addExtraMessage(
              data.error.details[0].message.split(': ').pop()
            );
            this.showMessage('Error: ' + message, true);
            this.depositDisable = false;
          }
        });
    } else {
      this.showMessage('Connect your wallet before depositing', true);
      this.depositDisable = false;
    }
  }

  onSetBuddy() {
    if (this.auth.user) {
      if (this.setBuddy == null || this.setBuddy == '') {
        this.showMessage('Invalid username for buddy', true);
        return;
      }

      this.eos
        .pushTransaction(
          'addbuddy',
          this.auth.user.username,
          { user: this.auth.user.username, buddy: this.setBuddy },
          'kompwnd'
        )
        .then((data: any) => {
          if (data.transaction_id) {
            let data: any = {
              username: this.auth.user.username,
              buddy: this.setBuddy,
            };
            if (!environment.mainnet) data.testnet = true;

            //Add info to database
            this.profile.post('/add-buddy', {
              username: this.auth.user.username,
              buddy: this.setBuddy,
            }).then((res: any) => console.log("Buddy ", res));

            this.init();
          } else {
            data = JSON.parse(data);
            this.showMessage(
              'Error: ' +
                data.error.details[0].message.split(': ').pop() +
                '. <br> If you cant find a buddy you can use kompwnd as your buddy to support the network',
              true
            );
            this.setBuddy = null;
          }
        });
      // alacli -v -u https://testapi.alacritys.net push action kompwnd addbuddy '["lizardking", "kompwnd"]' -p lizardking@active
    } else {
      this.showMessage('Must connect wallet first', true);
    }
  }

  onShareFriend() {
    this.claimDisable = true;
    if (this.auth.user) {
      this.eos
        .pushTransaction(
          'share',
          this.auth.user.username,
          {
            user: this.auth.user.username,
            user_friend: this.shareFriend,
            quantity: this.shareQuantity.toFixed(2) + ' USD',
          },
          'kompwnd'
        )
        .then((data: any) => {
          if (data.transaction_id) {
            this.showMessage('Share successful');
            // this.getDeposit();
            // let now = Math.floor(new Date().getTime() / 1000);
            // this.last_action = now;
            // this.calcAvailable();
            this.init();
            this.getVars().then(() => {
              this.claimDisable = false;
              if (this.rowsToShow != null) {
                this.showRows(this.rowsToShow);
              }
            });
          } else {
            console.log('DATA', data);

            data = JSON.parse(data);
            let message = this.addExtraMessage(
              data.error.details[0].message.split(': ').pop()
            );
            this.showMessage('Error: ' + message, true);
            this.claimDisable = false;
          }
        });
    } else {
      this.claimDisable = false;
      this.showMessage('Connect your wallet before claiming', true);
    }
  }

  async onClaim() {
    this.claimDisable = true;
    if (this.auth.user) {
      this.eos
        .pushTransaction(
          'claim',
          this.auth.user.username,
          { user: this.auth.user.username },
          'kompwnd'
        )
        .then((data: any) => {
          if (data.transaction_id) {
            this.getDeposit();
            let now = Math.floor(new Date().getTime() / 1000);
            this.last_action = now;
            this.calcAvailable();
            this.getVars().then(() => {
              this.claimDisable = false;
              if (this.rowsToShow != null) {
                this.showRows(this.rowsToShow);
              }
            });
            console.log(data);
            //Check if dividends were claimed
            if (
              data.processed.action_traces[0].console.search(
                'Minimum available dividends must be greater than'
              ) !== -1
            ) {
              this.showMessage(
                'Available dividends must be greater than $50.00 USD to claim dividends and match rewards.',
                true
              );
            } else {
              this.showMessage('Dividends claimed');
            }
          } else {
            data = JSON.parse(data);
            let message = this.addExtraMessage(
              data.error.details[0].message.split(': ').pop()
            );
            this.showMessage('Error: ' + message, true);
            this.claimDisable = false;
          }
        });
    } else {
      this.claimDisable = false;
      this.showMessage('Connect your wallet before claiming', true);
    }
  }

  async onRoll() {
    this.rollDisable = true;
    if (this.auth.user) {
      this.eos
        .pushTransaction(
          'roll',
          this.auth.user.username,
          { user: this.auth.user.username },
          'kompwnd'
        )
        .then((data: any) => {
          if (data.transaction_id) {
            this.showMessage('Roll successful');
            this.getDeposit();
            let now = Math.floor(new Date().getTime() / 1000);
            this.last_action = now;
            this.calcAvailable();
            this.calcAvailable(true);
            this.getVars().then(() => {
              this.rollDisable = false;
              if (this.rowsToShow != null) {
                this.showRows(this.rowsToShow);
              }
            });
            console.log(data);
            //Check if dividends were rolled
            if (
              data.processed.action_traces[0].console.search(
                'Minimum available dividends must be greater than'
              ) !== -1
            ) {
              this.showMessage(
                'Available dividends must be greater than $40.00 USD to roll dividends and match rewards.',
                true
              );
            } else {
              this.showMessage('Dividends rolled');
            }
          } else {
            data = JSON.parse(data);
            let message = this.addExtraMessage(
              data.error.details[0].message.split(': ').pop()
            );
            this.showMessage('Error: ' + message, true);
            this.rollDisable = false;
          }
        });
    } else {
      this.rollDisable = false;
      this.showMessage('Connect your wallet before rolling', true);
    }
  }

  getBuddies(buddies, skip = false, user = null) {
    console.log(buddies);

    let buddyArr = [];
    if (!skip) buddyArr.push({ user: buddies.user, buddy: user });
    if (buddies.buddies.length) {
      for (let buddy of buddies.buddies) {
        let subBuddies = this.getBuddies(buddy, false, buddies.user);
        buddyArr = [...buddyArr, ...subBuddies];
      }
    }
    return buddyArr;
  }

  async calcAvailable(daily: boolean = false) {
    this.kpwValue = await this.getKPWValue();
    //console.log('KPW VALUE', this.kpwValue);

    let now = Math.floor(new Date().getTime() / 1000) + 5;
    let seconds_dif = now - this.last_action;
    let days_passed = (daily ? 1 : seconds_dif / 86400);
    let days_percentage = days_passed / 200

    let reward: Token = {
      value: 0,
      precision: this.deposit.precision,
      symbol: this.deposit.symbol,
    };

    //Daily Rate
    if (daily) {
      //If the user has a record in the earning table
      if (this.earning.rows && this.earning.rows.length) {
        let row = this.earning.rows[0];
        if (row.user == this.auth.user.username) {
          reward.value = this.eos.toToken(row.dailyamount).value
        }
        else {
          reward.value= parseFloat(Number(this.deposit.value * days_percentage).toFixed(4))
        }
      }
      else {
        reward.value= parseFloat(Number(this.deposit.value * days_percentage).toFixed(4))
      }
      this.dailyEarning = this.eos.toString(reward);
      this.dailyEarningText = this.dailyEarning + ' / Day';
      this.conversion
        .kpwtousd(reward.value)
        .then((data) => (this.convertedDailyEarning = data));
    }
    //Current Dividends 
    else {
      let reward: Token = {
        value: 0,
        precision: this.deposit.precision,
        symbol: this.deposit.symbol,
      };
      //If the user has a record in the earning table
      if (this.earning.rows && this.earning.rows.length) {
        let row = this.earning.rows[0];
        if (row.user == this.auth.user.username) {
          let divAmount = this.deposit.value * row.earningrate * days_passed
          reward.value = divAmount
        }
        else {
          reward.value= parseFloat(Number(this.deposit.value * days_percentage).toFixed(4))
        }
      }
      else {
        reward.value= parseFloat(Number(this.deposit.value * days_percentage).toFixed(4))
      }
      if (reward.value > this.maxPay.value) reward = this.maxPay;

      if (!this.divs || reward.value !== this.divs.value) {
        this.divs = reward;
        this.conversion
          .kpwtousd(this.divs.value)
          .then((data) => (this.convertedDivs = data));
      }
    }
    let total = this.oldRewards.value + this.divs.value + this.oldMatch.value;
    if (total > this.maxPay.value) {
      let match_rewards = this.oldRewards.value + this.oldMatch.value;
      let over = total - this.maxPay.value;
      let sub_rewards = over * (this.oldRewards.value / match_rewards);
      let sub_match = over * (this.oldMatch.value / match_rewards);
      this.rewards.value = this.oldRewards.value - sub_rewards;
      this.match.value = this.oldMatch.value - sub_match;
    }
  }

  showMessage(message: string, error: boolean = false) {
    this.messageType = error ? 'error' : 'success';
    this.message = message;
    this.messageTimout = setTimeout(() => {
      this.hideMessage();
    }, 5000);
  }

  hideMessage() {
    this.message = null;
    clearTimeout(this.messageTimout);
  }

  async getVars() {
    let data: any = await this.eos.getRows({
      table: 'vars',
      scope: this.auth.active.username,
      limit: 200,
    });

    this.varRows = data.rows.sort((a, b) => {
      let aDate = a.dateTime;
      let bDate = b.dateTime;
      return aDate < bDate ? 1 : aDate == bDate ? 0 : -1;
    });

    return;
  }

  toggleMatches() {
    this.showMatchData = !this.showMatchData;
    this.showRows([3, 4]);
  }

  showRows(selected: number | number[] = null) {
    let tmp = {};
    let names = [
      'Available',
      'Deposits',
      'Claimed',
      'Rewards',
      'Match',
      'MaxPay',
    ];

    this.rowsToShow = selected;
    this.varRows.forEach(async (row, i) => {
      let date = new Date(row.dateTime * 1000);
      let dateTime =
        date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

      let token = this.eos.toToken(row.value);

      if (tmp[names[row.type]]) {
        tmp[names[row.type]].series.push();
        tmp[names[row.type]].rawdata[row.dateTime] = token.value;
      } else {
        tmp[names[row.type]] = <chartData>{
          name: names[row.type],
          series: [],
          rawdata: {
            [row.dateTime]: token.value,
          },
          previousValue: null,
        };
      }

      if (i + 1 == this.varRows.length) {
        let dates = {};
        let groups: chartData[] = Object.values(tmp);
        for (let group of groups) {
          dates = Object.assign(dates, group.rawdata);
        }

        for (let date of Object.keys(dates).sort((a, b) =>
          a < b ? 1 : a > b ? -1 : 0
        )) {
          let d = new Date(parseInt(date) * 1000);
          let dateTime = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
          for (let group of groups) {
            if (group.rawdata[date] || group.rawdata[date] == 0) {
              let data = await this.conversion.kpwtousd(group.rawdata[date]);

              tmp[group.name].series.push(<chartEntry>{
                name: dateTime,
                value: +data.substring(2, data.length - 4),
                kpw: group.rawdata[date],
              });

              tmp[group.name].previousValue = group.rawdata[date];
            } else {
              tmp[group.name].series.push(<chartEntry>{
                name: dateTime,
                kpw: tmp[group.name].previousValue || 0,
              });
            }
          }
        }

        this.chartsData = tmp;
        console.log('chart ', this.chartsData);
      }
    });
  }

  addExtraMessage(message: string) {
    let lcMessage = message.toLowerCase();
    if (lcMessage.includes('buddy'))
      message += '<br> Make sure you have added a buddy.';
    if (lcMessage.includes('deposit'))
      message += '<br> Make sure you made your first deposit.';
    if (lcMessage.includes('comparison'))
      message += '<br> Make sure your upline buddies have migrated.';
    return message;
  }

  openTiers(ev: Event) {
    ev.stopPropagation();
    this.dialog.open(TierModal);
  }
}

export interface Tier {
  value: number;
  percentage: number;
}

export interface Match {
  generation: number;
  percentage: number;
}

export interface chartData {
  name: string;
  series: chartEntry[];
  rawdata: {
    [key: string]: number;
  };
  previousValue: number;
}

interface chartEntry {
  name: string;
  value: number;
  kpw: number;
}

interface pieData {
  name: string;
  value: number;
  extra?: any;
}
