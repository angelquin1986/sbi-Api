import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-error401',
  templateUrl: './error401.component.html'
})
export class Error401Component implements OnInit {
  mail = localStorage.getItem('email');

  constructor() { }

  ngOnInit() {
  }

}
