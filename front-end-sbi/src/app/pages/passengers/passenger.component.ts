import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../services/order.service';
import {PassengerService} from '../../services/passenger.service';
import {NgForm} from '@angular/forms';
import {Passenger} from '../../models/passenger.model';

@Component({
  standalone: false,
  selector: 'app-passenger',
  templateUrl: './passenger.component.html',
  styles: []
})
export class PassengerComponent implements OnInit {

  public infoPax: any;
 /* passenger: Passenger = new Passenger('', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');*/
  titles = [
    {valor: 'Mr' },
    {valor: 'Mrs'},
    {valor: 'Ms'}
    ];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public _orderService: OrderService,
    public _paxService: PassengerService
  ) {
    route.params.subscribe( params => {
      let id = params['id'];
      this.mostrarInfoPax( id );
    });
  }

  ngOnInit() {
    this.route.params.subscribe( params => {
      this.mostrarInfoPax( params.id );
    });
  }

  mostrarInfoPax( id: string ) {
    /*this._paxService.cargarInfoPasajero( id )
      .subscribe( passenger => this.passenger = passenger );*/
  }

  actualizarPax ( updateForm: NgForm ) {
      console.log( updateForm.value );
  }

}
