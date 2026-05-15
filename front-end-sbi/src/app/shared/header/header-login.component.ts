import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-header-login',
  templateUrl: './header-login.component.html'
})
export class HeaderLoginComponent implements OnInit {

  public logoCompany = environment.logoName;

  constructor() { }

  ngOnInit() {
  }

}
