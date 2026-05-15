import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../config/config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    public http: HttpClient
  ) {
    console.log('Servicio de Order listo');
  }

  crearOrder( order: Order ) {
    const url = URL_SERVICIOS + '/order';

    return this.http.post( url, order );
  }

  obtenerOrder( id: string ) {
    const url = URL_SERVICIOS + '/order/' + id;

    return this.http.get(url).pipe(
      map((resp: any) => resp.order)
    );
  }

  actualizarOrder( id: string, order: Order ) {
    const url = URL_SERVICIOS + '/order/' + id;

    return this.http.put( url, order ).pipe(
      map( (resp: any ) => resp.order)
    );
  }

  listadoOrders() {
    return this.http.get(URL_SERVICIOS + '/order');
  }

}
