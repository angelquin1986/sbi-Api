import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {URL_SERVICIO_SENDMAIL} from '../config/config';


@Injectable({
  providedIn: 'root'
})
export class SendmailService {

  private url = URL_SERVICIO_SENDMAIL;

  constructor( private http: HttpClient ) {
    console.log('Servicio de Envio Correo listo...!!');
  }

  sendMailBooking( datos: any ) {
    return this.http.post(this.url, datos);
  }

}
