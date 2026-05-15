import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-footer-login',
  templateUrl: './footer-login.component.html',
  styles: []
})
export class FooterLoginComponent implements OnInit {

  public sitioCompania = environment.siteCompany;
  public yearToday = new Date().getFullYear();

  constructor() { }

  ngOnInit() {
  }

}
