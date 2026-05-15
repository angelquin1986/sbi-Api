import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../config/config';
import { FileO } from '../models/file.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {

  private url = URL_SERVICIOS;

  constructor( private http: HttpClient ) {
    console.log('servicio Imagen listo');
  }

  getImagen(archivo) {
    return this.http.get(this.url + '/archivo/' + archivo );
  }

  crearArchivo(archivo: FileO) {
    return this.http.post(this.url + '/archivo',  archivo);
  }

  listaArchivos(order) {
    return this.http.get(this.url + '/archivo/' + order);
  }

  actualizarArchivo( idArchivo: string, archivo: FileO ) {
    const url = URL_SERVICIOS + '/archivo/' + idArchivo;

    return this.http.put( url, archivo ).pipe(
      map( (resp: any ) => resp.file)
    );
  }

  eliminaArchivoTemporal(nombreArchivo) {
    return this.http.get(this.url + '/archivo/delete/' + nombreArchivo );
  }

}
