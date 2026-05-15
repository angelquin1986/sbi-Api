import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from '../config/config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(
    public http: HttpClient
  ) {
    console.log('Servicio de Paises listo');
  }

  mostrarPaises() {
    const url = URL_SERVICIOS + '/country';

    return this.http.get(url).pipe(
      map((resp: any) => resp)
    );
  }
}
