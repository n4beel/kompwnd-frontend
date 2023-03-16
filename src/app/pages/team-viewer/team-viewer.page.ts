import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConversionService } from 'src/_services/conversion.service';
import { Buddies, Deposit, EosService, Token } from 'src/_services/eos.service';

@Component({
  templateUrl: 'team-viewer.page.html',
  styleUrls: ['team-viewer.page.scss'],
})
export class TeamViewerPage {
  username: string;
  startDate: string;
  endDate: string;
  deposits: boolean = false;
  isTeamViewer: boolean = true;
  isAnalytic: boolean = false;

  message: string;
  messageType: 'error' | 'success';
  messageTimout: NodeJS.Timeout;
  team: Buddies;
  teamAnalytics: Buddies;

  deposit: Deposit;
  teamTotal: number = 0;
  available: Token;

  convertedAvailable: string = '';
  convertedDeposit: string = '';
  convertedDivspayed: string = '';
  convertedRewards: string = '';
  convertedMatch: string = '';
  convertedMaxdiv: string = '';

  conversionInterval;

  loading: boolean = false;

  constructor(private eos: EosService, private conversion: ConversionService) {}

  onGetTeam() {
    if (this.username == null || this.username == '') {
      this.showMessage('Username not set.', true);
      return;
    }
    this.loading = true;
    this.eos.getTeam(this.username, this.deposits).then(async (team) => {
      this.team = team;
      this.teamTotal = await this.countTeam(this.team);
      if (team.deposit) {
        this.deposit = team.deposit;
        this.calcAvailable();
        this.usdConversion();
        this.conversionInterval = setInterval(() => {
          this.usdConversion();
        }, 1000);
      } else {
        this.deposit = null;
        this.available = null;
      }
      this.loading = false;
    });
  }

  onGetAnalytics() {
    const todayDate = +new Date();
    const startDateStamp = +new Date(this.startDate);
    const endDateStamp = +new Date(this.endDate);

    if (this.username == null || this.username == '') {
      this.showMessage('Username not set.', true);
      return;
    } else if (!this.startDate) {
      this.showMessage('Start Date not set.', true);
      return;
    } else if (!this.endDate) {
      this.showMessage('End Date not set.', true);
      return;
    } else if (startDateStamp > endDateStamp) {
      this.showMessage('Start Date cannot be greater than End Date.', true);
      return;
    } else if (endDateStamp > todayDate) {
      this.showMessage('End Date cannot be of future.', true);
      return;
    }

    this.deposits = true;
    this.loading = true;
    this.eos
      .getTeamAnalyticsView(this.username, this.deposits)
      .then(async (team) => {
        var dateValidation = function (teamObj) {
          const teamStamp = +new Date(teamObj.deposit.last_action * 1000);
          if (teamStamp > startDateStamp && teamStamp < endDateStamp) {
            return true;
          } else {
            teamObj['buddies'] = [];
            teamObj['calculatedDepositForSubBuddies'] = '';
            teamObj.deposit = null;
          }

          if (teamObj && teamObj.buddies.length) {
            for (let i = 0; i < teamObj.buddies.length; i++) {
              dateValidation(teamObj.buddies[i]);
            }
          }
          return teamObj;
        };

        this.teamAnalytics = dateValidation(team);
        this.teamAnalytics = team;
        this.teamTotal = await this.countTeam(this.teamAnalytics);
        if (team.deposit) {
          this.deposit = team.deposit;
          this.calcAvailable();
          this.usdConversion();
          this.conversionInterval = setInterval(() => {
            this.usdConversion();
          }, 1000);
        } else {
          this.deposit = null;
          this.available = null;
        }
        this.loading = false;
      });
  }

  onDeposits(e: MatSlideToggleChange) {
    if (this.username) {
      this.onGetTeam();
    }
  }

  async countTeam(team: Buddies) {
    let count: number = team && team.buddies.length;
    for (let buddy of team.buddies) {
      count += await this.countTeam(buddy);
    }
    return count;
  }

  calcAvailable() {
    let now = Math.floor(new Date().getTime() / 1000);
    let seconds_dif = now - this.deposit.last_action;
    let past_days = seconds_dif / 86400 / 100;
    let reward: Token = {
      value: parseFloat(
        Number(this.deposit.deposit.value * past_days).toFixed(4)
      ),
      precision: this.deposit.deposit.precision,
      symbol: this.deposit.deposit.symbol,
    };
    if (reward.value > this.deposit.maxdiv.value) reward = this.deposit.maxdiv;
    this.available = reward;
  }

  async usdConversion() {
    //Check the symbol for proper conversion
    if (this.deposit.deposit.symbol == 'KPW') {
      this.convertedAvailable = await this.conversion.kpwtousd(
        this.available.value
      );
      this.conversion
        .kpwtousd(this.deposit.deposit.value)
        .then((data) => (this.convertedDeposit = data));
      this.conversion
        .kpwtousd(this.deposit.divspayed.value)
        .then((data) => (this.convertedDivspayed = data));
      this.conversion
        .kpwtousd(this.deposit.rewards.value)
        .then((data) => (this.convertedRewards = data));
      this.conversion
        .kpwtousd(this.deposit.match.value)
        .then((data) => (this.convertedMatch = data));
      this.conversion
        .kpwtousd(this.deposit.maxdiv.value)
        .then((data) => (this.convertedMaxdiv = data));
    } else if (this.deposit.deposit.symbol == 'USD') {
      this.convertedAvailable = await this.conversion.usdtokpw(
        this.available.value
      );
      this.conversion
        .usdtokpw(this.deposit.deposit.value)
        .then((data) => (this.convertedDeposit = data));
      this.conversion
        .usdtokpw(this.deposit.divspayed.value)
        .then((data) => (this.convertedDivspayed = data));
      this.conversion
        .usdtokpw(this.deposit.rewards.value)
        .then((data) => (this.convertedRewards = data));
      this.conversion
        .usdtokpw(this.deposit.match.value)
        .then((data) => (this.convertedMatch = data));
      this.conversion
        .usdtokpw(this.deposit.maxdiv.value)
        .then((data) => (this.convertedMaxdiv = data));
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

  onTeamviewer() {
    this.isTeamViewer = true;
    this.isAnalytic = false;
    // window.location.reload();
  }
  onAnalytics() {
    this.isTeamViewer = false;
    this.isAnalytic = true;
    // window.location.reload();
  }
}
