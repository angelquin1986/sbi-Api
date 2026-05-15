import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class LoginService {
  private url = 'https://rest.galavail.com/webservice/booking/';

  constructor( private http: HttpClient ) {
    console.log('servicio  listo');
  }

  postInicia(pass: string, user: string) {
    const headers = new HttpHeaders(
      {'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(user + ':' + pass)});
    return this.http.post(this.url + 'login/', '', { headers: headers } );
  }

}
