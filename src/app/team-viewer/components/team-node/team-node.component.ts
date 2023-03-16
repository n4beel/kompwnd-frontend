import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-team-node',
  templateUrl: './team-node.component.html',
  styleUrls: ['./team-node.component.scss']
})
export class TeamNodeComponent implements OnInit {
  @Input() name 
  @Input() subordinates 

  constructor() { }

  ngOnInit(): void {
  }

}
