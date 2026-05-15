import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { URL_SERVICIOS} from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class FindService {

  private url = URL_SERVICIOS;

  constructor( private http: HttpClient ) {
    console.log('servicio Busqueda listo');
  }

  obtenerOrders(rol, idAgente, fecIncio, fecFin, nombreContacto, tm ) {
    return this.http.get(URL_SERVICIOS + '/busqueda/orders/' + rol + '/' + idAgente + '/' + fecIncio + '/' + fecFin + '/' + nombreContacto + '/' + tm);
  }

  obtenerOrdersporMes(idAgente) {
    return this.http.get(URL_SERVICIOS + '/busqueda/mes/' + idAgente );
  }

  obtenerCantTM(idAgente) {
    return this.http.get(URL_SERVICIOS + '/busqueda/cuentaTM/' + idAgente  );
  }

}
