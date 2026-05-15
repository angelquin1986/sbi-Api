import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  forma: FormGroup;

  constructor() {
    this.forma = new FormGroup({
      country: new FormControl(''),
      telephone: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressnext: new FormControl('', Validators.required)
    })
  }

  ngOnInit() {
  }

  guardarCambios() {
    console.log( this.forma.value );
    console.log( this.forma );
  }

}
