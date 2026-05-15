import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../config/config';
import { map } from 'rxjs/operators';
import { Passenger } from '../models/passenger.model';

@Injectable({
  providedIn: 'root'
})
export class PassengerService {

  constructor(
    public http: HttpClient
  ) {
    console.log('Servicio de Passenger listo');
  }

  crearPasajero( passenger: Passenger ) {
    const url = URL_SERVICIOS + '/pax';

    return this.http.post( url, passenger );
  }

  listadoPasajeros( idorder: string ) {
    const url = URL_SERVICIOS + '/pax/' + idorder;

    return this.http.get( url ).pipe(
      map( (resp: any ) => resp.passengers)
    );
  }

  cargarInfoPasajero( id: string ) {
    const url = URL_SERVICIOS + '/pax/findpax/' + id;

    return this.http.get( url ).pipe(
      map( (resp: any ) => resp.passenger)
    );
  }

  /* actualizarPasajero( id: string ) {
    let url = URL_SERVICIOS + '/pax/' + id;

    return this.http.put( url, id )
      .map( (resp: any ) => resp.passenger);
  } */

  actualizarPasajero( id: string, pax: Passenger ) {
    const url = URL_SERVICIOS + '/pax/' + id;

    return this.http.put( url, pax ).pipe(
      map( (resp: any ) => resp.passenger)
    );
  }

}
