import { Component, Input } from '@angular/core';
import { Buddies } from 'src/_services/eos.service';

@Component({
  selector: 'analytics-viewer',
  templateUrl: 'analytics.component.html',
  styleUrls: ['analytics.component.scss'],
})
export class AnalyticsViewerComponent {
  @Input('team') team: Buddies;
  @Input('deposit') deposit: boolean;
  @Input('first') first: boolean;

  open: boolean = true;
  dOpen: boolean = false;
  tOpen: boolean = true;
}
