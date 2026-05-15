import { Component, OnInit } from '@angular/core';

import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-success-booking',
  templateUrl: './success-booking.component.html',
  styleUrls: ['../../../assets/css/styles.css']
})
export class SuccessBookingComponent implements OnInit {

  public nombreCompania = environment.nameCompany;
  public sitioCompania = environment.siteCompany;
  public urlCompania = environment.urlSiteCompany;

  constructor() { }

  ngOnInit() {
  }

}
