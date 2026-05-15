import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-header-contactos-publico',
  templateUrl: './header-contactos-publico.component.html',
  styles: []
})
export class HeaderContactosPublicoComponent implements OnInit {

  public logoCompany = environment.logoName;

  constructor() { }

  ngOnInit() {
  }

}
