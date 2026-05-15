import { Pipe, PipeTransform } from '@angular/core';
import { URL_SERVICIOS} from '../config/config';

@Pipe({
  standalone: false,
  name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

  transform(archivo: any): any {

    const url = URL_SERVICIOS + '/' + archivo['ruta'] + '/' + archivo['carpeta'] + '/' + archivo['archivo'];

    return url ;
  }

}
