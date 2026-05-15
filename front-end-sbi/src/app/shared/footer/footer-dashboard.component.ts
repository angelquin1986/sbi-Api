import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-footer-dashboard',
  templateUrl: './footer-dashboard.component.html',
  styles: []
})
export class FooterDashboardComponent implements OnInit {

  public sitioCompania = environment.siteCompany;
  public yearToday = new Date().getFullYear();

  constructor() { }

  ngOnInit() {
  }

}
