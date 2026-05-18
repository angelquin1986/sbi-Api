import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { OrderService} from '../../services/order.service';
import {FormControl, NgForm} from '@angular/forms';
import { Order} from '../../models/order.model';
import { FileUploader, FileItem} from 'ng2-file-upload';
import { Documento } from '../../models/document.model';
import { URL_SERVICIOS} from '../../config/config';
import { MatDialog} from '@angular/material/dialog';
import { Seller} from '../../models/seller.model';
import { UserService} from '../../services/user.service';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import {environment} from '../../../environments/environment';

import * as _moment from 'moment';
import {
  DialogInsuranceInfoEditComponent,
  DialogRemoveFileComponent,
  DialogRemoveFilesComponent
} from '../booking/edit-booking.component';
import {DocumentoService} from '../../services/documento.service';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const moment: any = (_moment as any).default ?? _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
const URL = URL_SERVICIOS + '/uploadDocuments/';

@Component({
  standalone: false,
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styles: [
    ` .mat-datepicker-toggle-active {
          color: #ee7600;
        }`
  ],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
  styleUrls: ['../../../assets/css/styles.css']
})
export class DocumentsComponent implements OnInit {

  public mail = atob(localStorage.getItem('email'));
  public usuario = localStorage.getItem('usuario');
  public cambiaClase = 'medium';
  public imagenTemp: object [] = [];
  public archivosTemporales: FileUploader = new FileUploader({url: URL, itemAlias: 'temporales'});
  public sobreElemento = false;
  public idOrder = '';
  public order: Order;
  public numArchivos: number;
  // folderObj: Folder = new Folder();


  public listPassengers: any;
  public numberPaxs: string;
  public archivosSubidos: any;

  public date = new FormControl(moment());
  public minDateArrival = new Date();
  public minDateDeparture = new Date();

  public codeSeller: string;
  public nameSeller: string;
  public mailSeller: string;
  public listCountries: any;
  public sellers: Seller [] = [];
  public extArchivos: any[] = [
    { tipo: 'image',
      posicion: '0'},
    { tipo: 'msword', // .doc
      posicion: '12'},
    { tipo: 'word',  // .docx
      posicion: '46'},
    { tipo: 'pdf',
      posicion: '12'}
  ];

  public nombreCompania = environment.nameCompany;
  public sitioCompania = environment.siteCompany;
  public urlCompania = environment.urlSiteCompany;

  public encodeFile: string;

  public msgErrorExtensionFile: boolean;
  public msgErrorSizeFile: boolean;

  constructor (
    public route: ActivatedRoute,
    public router: Router,
    public _orderService: OrderService,
    public _sellerService: UserService,
    public documentoService: DocumentoService,
    public dialog: MatDialog
  ) { }


  ngOnInit() {


    if (this.usuario === null) {
      if ( this.nombreCompania === 'Galapagos Travel Center' ) {
        this.cambiaClase = 'large';
      } else {
        this.cambiaClase = 'largerg';
      }
      // this.cambiaClase = 'large';
      this.msgErrorSizeFile = false;
      this.msgErrorExtensionFile = false;
    }
    this.order = new Order(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      false,
      null,
      null,
      null
    );
    this.route.params.subscribe(params => {
      this.idOrder = params.idorder;
      this.cargarCabeceraOrder(params.idorder);
      this.extraeArchivos(params.idorder);

    });
  }

  verificaVendedor( order: string ) {
    this._orderService.obtenerOrder( order ).subscribe(
      (orderVerifica: Order) => {
        for (const seller of this.sellers) {
          if ( Number(seller.id) === Number(orderVerifica.sales_agent_id) ) {
            if (seller.mailseller === this.mail) {
              console.log('correcto');
              this.cargarCabeceraOrder(order);
              this.extraeArchivos(order);
            } else {
              console.log('incorrecto');
              return this.router.navigate(['/error401']);
            }
          }
        }
      });
  }

  cargarCabeceraOrder( id: string ) {
    this._orderService.obtenerOrder( id )
      .subscribe( order => {
        // console.log( order );
        this.order = order;
        // console.log('Posee TM.?: ' + this.order.tm_date_cruise);
        this.codeSeller = this.order.sales_agent_id;
        this.mostrarDatosVendedor( this.codeSeller );
        // this.countdownOrder( this.order.tm_date_cruise );
      });
  }

  mostrarDatosVendedor( id: string ) {
    this._sellerService.getInfoSeller( id )
      .subscribe( respax => {
        let result: any;
        result = respax;
        this.nameSeller = result.usuario[0]['nseller'];
        this.mailSeller = result.usuario[0]['mailseller'];
      });
  }

  almacenaImagen(archivo: FileItem) {
    if (archivo.file.type.indexOf('image') >= 0 ) {
      const reader = new FileReader();
      const urlTemp = reader.readAsDataURL(archivo._file);
      reader.onloadend = () => {
        this.imagenTemp.push({'id': archivo.file.name, 'data': reader.result});
      };
    }
  }

  muestraImagen(nombreArchivo) {
    for (const img of this.imagenTemp) {
      if (img['id'] === nombreArchivo) {
        return img['data'];
      }
    }
  }

  agregaInput(archivo: File) {
    let extPermitida = false;
    for (const tipoA of this.extArchivos) {
      if (archivo.type.startsWith(tipoA.tipo, tipoA.posicion) === true) {
        const nuevoArchivo = new FileItem(this.archivosTemporales, archivo, {} as any);
        const dividirNombre = nuevoArchivo.file.name.split('.');
        const extArchivo = dividirNombre[dividirNombre.length - 1];
        nuevoArchivo.file.name = this.order._id + '_' + Date.now() + '.' + extArchivo;
        /*this.archivosTemporales.queue.push(nuevoArchivo);
        this.archivosTemporales.uploadAll();
        this.almacenaImagen(nuevoArchivo);
        this.archivosSubidos.push({file_id_order: this.order._id, file_name: nuevoArchivo.file.name, file_name_user: archivo.name,
          file_size: (( archivo.size / 1024 / 1024).toFixed(2) + ' MB' ), file_status: '1', 'estado': true });*/

        // Condicionante que valida que el archivo a subir no pese mas de 1.5 Mb
        if ( nuevoArchivo._file.size < 10485760 ) { // temporalmente se lo subio a 10Mb
          // console.log('El tamaño es aceptable');
          this.msgErrorSizeFile = false;
        } else {
          // console.log('El tamaño NO aceptable');
          this.msgErrorSizeFile = true;
        }
        // Condicionante que valida que el archivo tenga extensiones indicadas para subir
        if ( extArchivo === 'jpg' || extArchivo === 'jpeg' || extArchivo === 'png' || extArchivo === 'JPG' || extArchivo === 'PNG' ) {
          // console.log('extension archivo valido');
          this.msgErrorExtensionFile = false;
        } else {
          // console.log('extension archivo NO valido');
          this.msgErrorExtensionFile = true;
        }

        if ( this.msgErrorSizeFile === false && this.msgErrorExtensionFile === false ) {
          // console.log('Almacena el archivo temporalmente antes de registrarlo');

          this.archivosTemporales.queue.push(nuevoArchivo);
          this.archivosTemporales.uploadAll();
          this.almacenaImagen(nuevoArchivo);
          this.archivosSubidos.push({document_id_order: this.order._id, document_name: nuevoArchivo.file.name, document_name_user: archivo.name,
            document_size: (( archivo.size / 1024 / 1024).toFixed(2) + ' MB' ), document_status: '1', 'estado': true });
        }

        extPermitida = true;
      }
    }
    if (!extPermitida) {
      alert('Tipo de archivo no permitido');
    }
  }

  guardaArchivos() {
    for (const item2 of this.archivosTemporales.queue) {
      // const varEncoded = this.getEncodedImage( item2.file.name );
      // this.documentoService.eliminaDocumentoTemporal(item2.file.name).subscribe(
      //   (info: any) => {
          // console.log(info);
          item2.isSuccess = false;
          item2.isUploaded = false;
          item2.file.name = 'file_' + item2.file.name;
          this.archivosTemporales.uploadAll();
          const archivo: Documento = { 'document_name': item2.file.name, 'document_name_user': item2._file.name,
            'document_size': (( item2.file.size / 1024 / 1024).toFixed(2) + ' MB' ), 'document_id_order': this.order._id, 'document_date': new Date().getTime() /*'file_encode': varEncoded */ };
          this.documentoService.crearDocumento(archivo).subscribe(
            (archivoGuardado: any) => {
              // console.log(archivoGuardado);
            });
        // });
    }

    this.router.navigate(['/success-booking' ]);
  }

  quitarArchivos() {
    let a: number;
    for ( a = 0; a < this.archivosSubidos.length ; a++) {
      this.cambiaEstado(this.archivosSubidos[a]._id);
    }
    for (const item2 of this.archivosTemporales.queue) {
      this.documentoService.eliminaDocumentoTemporal(item2.file.name).subscribe(
        (info: any) => {
          console.log(info);
        });
    }
    this.archivosTemporales.clearQueue();
    this.imagenTemp = [];
    this.archivosSubidos = [];
  }

  quitarArchivo(item) {
    console.log(item);
    console.log(this.archivosTemporales);
    this.documentoService.eliminaDocumentoTemporal(this.archivosTemporales.queue[item].file.name).subscribe(
      (info: any) => {
        console.log(info);
        this.archivosTemporales.removeFromQueue( item );
        this.archivosSubidos = [];
        this.extraeArchivos(this.order._id);
      });
  }

  extraeArchivos(order) {
    this.documentoService.listaDocumentos(order).subscribe(
      (archivos: any) => {
        this.archivosSubidos = archivos.documents;
        this.numArchivos = archivos.documents.length;
        for (const item of this.archivosTemporales.queue) {
          this.archivosSubidos.push({document_id_order: this.order._id, document_name: item.file.name, document_name_user: item._file.name,
            document_size: (( item.file.size / 1024 / 1024).toFixed(2) + ' MB' ), document_status: '1', 'estado': true });
        }
        /** request completed */
      });
  }

  cambiaEstado(idArchivo) {
    let a: number;
    for ( a = 0; a < this.archivosSubidos.length ; a++) {
      if (this.archivosSubidos[a]._id === idArchivo) {
        this.archivosSubidos[a].document_status = '0';
        const fileA: Documento = this.archivosSubidos[a];
        this.documentoService.actualizarDocumento(idArchivo, fileA).subscribe(
          (archivos: any) => {
            this.archivosSubidos = [];
            this.extraeArchivos(this.order._id);
          });
      }
    }
  }

  cambiaEstadoTodo() {
    let a: number;
    for ( a = 0; a < this.archivosSubidos.length ; a++) {
        this.archivosSubidos[a].document_status = '0';
        const fileA: Documento = this.archivosSubidos[a];
        this.documentoService.actualizarDocumento(this.archivosSubidos[a]._id, fileA).subscribe(
          (archivos: any) => {
            this.archivosSubidos = [];
            this.extraeArchivos(this.order._id);
          });
    }
  }

  dialoQuitarArchivos() {
    const dialogo = this.dialog.open(DialogRemoveFilesComponent, {
      height: '200px'
    });
    dialogo.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        this.quitarArchivos();
        this.cambiaEstadoTodo();
      }
    });
  }

  dialoQuitarArchivo(tipo, id) {
    const dialogo = this.dialog.open(DialogRemoveFileComponent, {
      height: '200px'
    });
    dialogo.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
      if (result) {
        switch (tipo) {
          case 'cambia':
            this.cambiaEstado(id);
            break;
          case 'quita':
            this.quitarArchivo(id);
            break;
        }
      }
    });
  }

}

//export class DialogPassportInfoEditComponent {}

