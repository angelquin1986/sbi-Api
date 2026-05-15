import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../config/config';
import { Documento } from '../models/document.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  private url = URL_SERVICIOS;

  constructor( private http: HttpClient ) {
    console.log('servicio Documento listo');
  }

  getDocumento(archivo) {
    return this.http.get(this.url + '/documento/' + archivo );
  }

  crearDocumento(archivo: Documento) {
    return this.http.post(this.url + '/documento',  archivo);
  }

  listaDocumentos(order) {
    return this.http.get(this.url + '/documento/' + order);
  }

  actualizarDocumento( idArchivo: string, archivo: Documento ) {
    console.log(idArchivo)
    const url = URL_SERVICIOS + '/documento/' + idArchivo;
    console.log(url)
    return this.http.put( url, archivo ).pipe(
      map( (resp: any ) => resp.document)
    );
  }

  eliminaDocumentoTemporal(nombreArchivo) {
    return this.http.get(this.url + '/documento/delete/' + nombreArchivo );
  }

}
