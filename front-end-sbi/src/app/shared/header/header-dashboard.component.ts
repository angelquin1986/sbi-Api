import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-header-dashboard',
  templateUrl: './header-dashboard.component.html',
  styles: []
})
export class HeaderDashboardComponent implements OnInit {

  public logoCompany = environment.logoName;

  constructor() { }

  ngOnInit() {
  }

}
