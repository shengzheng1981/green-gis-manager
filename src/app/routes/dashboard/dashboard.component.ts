import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  componentVisible : boolean = false;
  layoutVisible : boolean = false;
  mapVisible : boolean = false;

  constructor() {

  }

  ngOnInit() {

  }



  ngOnDestroy(): void {

  }



}
