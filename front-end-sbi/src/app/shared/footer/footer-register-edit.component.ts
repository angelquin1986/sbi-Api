import { Component, OnInit } from '@angular/core';

import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-footer-register-edit',
  templateUrl: './footer-register-edit.component.html',
  styles: []
})
export class FooterRegisterEditComponent implements OnInit {

  public sitioCompania = environment.siteCompany;
  public yearToday = new Date().getFullYear();

  constructor() { }

  ngOnInit() {
  }

}
