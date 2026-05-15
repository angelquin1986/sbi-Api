import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import { OrderService } from '../../services/order.service';
import {Order} from '../../models/order.model';
import {Router} from '@angular/router';
import {PassengerService} from '../../services/passenger.service';
import {Passenger} from '../../models/passenger.model';


@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: []
})
export class RegisterComponent implements OnInit {

  forma: FormGroup;

  sellers = [
    {id: 1, nseller: 'Esteba Mancheno', mailseller: 'esteba@galapagosislands.com'},
    {id: 2, nseller: 'Lilian Chafla', mailseller: 'lili@galapagosislands.com'},
    {id: 3, nseller: 'Lorena Alulema', mailseller: 'lorena@galapagosislands.com'},
    {id: 4, nseller: 'Rosa Mena', mailseller: 'rosa@galapagosislands.com'},
  ];

  constructor(
    public _orderService: OrderService,
    public _paxService: PassengerService,
    public route: Router
  ) {
  }

  ngOnInit() {
    this.forma = new FormGroup({
      contactName: new FormControl( null, Validators.required ),
      contactMail: new FormControl( null, [Validators.required, Validators.email] ),
      salesAgent: new FormControl( null, Validators.required ),
      numberPax: new FormControl( null, Validators.required ),
      dateSubmited: new FormControl( '2018-06-19' ),
      billingCountry: new FormControl( null, Validators.required ),
      billingPhone: new FormControl( null, Validators.required ),
      billingAddress: new FormControl( null, Validators.required ),
      billingCity: new FormControl( null )
    });
  }

  /*registrarOrder() {

    const order = new Order(
      this.forma.value.contactName,
      this.forma.value.contactMail,
      this.forma.value.salesAgent,
      this.forma.value.numberPax,
      this.forma.value.dateSubmited,
      this.forma.value.billingCountry,
      this.forma.value.billingPhone,
      this.forma.value.billingAddress,
      this.forma.value.billingCity
    );
    this._orderService.crearOrder( order )
      // .subscribe( resp => this.route.navigate(['/passengers' ]));
      .subscribe( resp => {
          let arreglo: any;
          arreglo = resp;
          console.log( arreglo.order._id );
          console.log( resp );

          this.route.navigate(['/passengers/' + arreglo.order._id ]);

          for (let i = 0; i < arreglo.order.number_pax; i++ ){
            const pasajero = new Passenger('Mr', 'FirstName' + i, 'LastName' + i, 'US', 'Jan', '01', '1990', '111111' + i, 'Dec', '12', '2020', 'EmergencyContact', 'A+', 'InsuranceCompany', '999999', 'ContactHotel', 'None');
            this._paxService.crearPasajero( pasajero )
              .subscribe( respuesta=>{
                  console.log('Pasajero ' + i + ' registrado');
              });
          }
      });

    //console.log(this.forma.value);
    return false;
  }*/

  /*Validaciones para el ingerso Letras, Numeros */
  validarLetras(e) {
    const tecla = (document.all) ? e.keyCode : e.which;
    if (tecla === 8) {
      return true;
    }
    const patron =  /^[a-zA-Z]*$/;
    const te = String.fromCharCode(tecla);
    return patron.test(te);
  }

  validarNumeros(e) {
    const tecla = (document.all) ? e.keyCode : e.which;
    if (tecla === 8) {
      return true;
    }
    const patron = /^[0-9]$/;
    const te = String.fromCharCode(tecla);
    return patron.test(te);
  }

}
