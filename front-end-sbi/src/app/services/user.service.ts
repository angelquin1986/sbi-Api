import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { URL_SERVICIOS} from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url = URL_SERVICIOS;

  constructor( private http: HttpClient ) {
    console.log('servicio Contactos listo');
  }

  getSellers() {
    return this.http.get(this.url + '/usuario');
  }

  getSellersVendedor() {
    return this.http.get(this.url + '/usuario/vendedor');
  }

  getSeller(email) {
    return this.http.get(this.url + '/usuario/' + email);
  }

  getInfoSeller( id: string) {
    return this.http.get(this.url + '/usuario/seller/' + id);
  }

  getSellersCompany( name: string ) {
    return this.http.get(this.url + '/usuario/company/' + name);
  }

  getSellerByUser( user: string ) {
    return this.http.get(this.url + '/usuario/user/' + user);
  }

}
