import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-footer-contactos-publicos',
  templateUrl: './footer-contactos-publicos.component.html',
  styles: []
})
export class FooterContactosPublicosComponent implements OnInit {

  public sitioCompania = environment.siteCompany;
  public yearToday = new Date().getFullYear();

  constructor() { }

  ngOnInit() {
  }

}
