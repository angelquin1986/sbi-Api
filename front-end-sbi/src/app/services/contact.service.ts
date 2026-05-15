import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { URL_SERVICIOS} from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private url = URL_SERVICIOS;
  private urlIP = 'https://jsonip.com/';

  constructor( private http: HttpClient ) {
    console.log('servicio Contactos listo');
  }

  getContactos() {
    return this.http.get(this.url + '/contactos');
  }

  getIp() {
    return this.http.get(this.urlIP);
  }

}
