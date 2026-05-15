import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/order.model';
import {PassengerService} from '../../services/passenger.service';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-passengers',
  templateUrl: './passengers.component.html',
  styles: []
})
export class PassengersComponent implements OnInit {

  public idOrder: any;
  public order: Order;

  public nameSeller: string;
  public mailSeller: string;

  public listaPassengers: any;

  public numberPaxs: string;

  public passenger: any;

  formaListaPax: FormGroup;

  sellers = [
    {id: 1, nseller: 'Esteba Mancheno', mailseller: 'esteba@galapagosislands.com'},
    {id: 2, nseller: 'Lilian Chafla', mailseller: 'lili@galapagosislands.com'},
    {id: 3, nseller: 'Lorena Alulema', mailseller: 'lorena@galapagosislands.com'},
    {id: 4, nseller: 'Rosa Mena', mailseller: 'rosa@galapagosislands.com'},
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public _orderService: OrderService,
    public  _paxService: PassengerService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      // console.log( params.id );
      // return this.cargarCabeceraOrder( params.id );
      this.cargarCabeceraOrder( params.id );
      this.mostrarPasajeros( params.id );
    });
  }

  cargarCabeceraOrder( id: string ) {
    this._orderService.obtenerOrder( id )
      .subscribe( order => {
        this.order = order;
        const codigoSeller: number = Number(this.order.sales_agent_id);
        this.numberPaxs = order.number_pax;
        for (let i = 0; i < this.sellers.length; i++ ) {
          // console.log( this.sellers[i].id );
          if ( this.sellers[i].id === codigoSeller ) {
            this.nameSeller = this.sellers[i].nseller;
            this.mailSeller = this.sellers[i].mailseller;
          }
        }
      });
  }

  mostrarPasajeros( idOrder: string) {
    this._paxService.listadoPasajeros( idOrder )
      .subscribe( paxs => {

          this.listaPassengers = paxs;

          console.log( this.listaPassengers );
      });
  }

  actualizarPasajeros() {
  }

}
