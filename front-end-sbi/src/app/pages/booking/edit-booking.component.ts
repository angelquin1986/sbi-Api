import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { PassengerService} from '../../services/passenger.service';
import { OrderService} from '../../services/order.service';
import {FormControl, NgForm} from '@angular/forms';
import { Passenger} from '../../models/passenger.model';
import { Order} from '../../models/order.model';
import { FileUploader, FileItem} from 'ng2-file-upload';
import { ArchivoService} from '../../services/archivo.service';
import { FileO } from '../../models/file.model';
import { URL_SERVICIOS} from '../../config/config';
import { MatDialog} from '@angular/material/dialog';
import { Seller} from '../../models/seller.model';
import { UserService} from '../../services/user.service';
import {CountryService} from '../../services/country.service';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';


import {environment} from '../../../environments/environment';


import * as CryptoJS from 'crypto-js';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
import {DialogInsuranceInfoComponent, DialogPassportInfoComponent} from './booking.component';
// tslint:disable-next-line:no-duplicate-imports
// import {default as _rollupMoment} from 'moment';

const moment = _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
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

const URL = URL_SERVICIOS + '/upload/';


@Component({
  standalone: false,
  selector: 'app-edit-booking',
  templateUrl: './edit-booking.component.html',
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
export class EditBookingComponent implements OnInit {
  public mail = atob(localStorage.getItem('email'));
  public usuario = localStorage.getItem('usuario');
  public tiempo = false;
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
  isLoading = false;
  rowsLoading: any[] = [];

  public arraySelectNacimiento = [];
  public arraySelectExpiracion = [];
  public fechaActualInit: Date = new Date();
  public anioActual: number = this.fechaActualInit.getFullYear(); 
  public aniosMaximoNacimiento: number = 100;
  public anioInicialNacimiento: number = this.anioActual;;
  public anioInicialExpiracion: number = this.anioActual;
  public aniosMaximoExpiracion: number = 20;

  public usShoeSizeMin: number = 3;
  public usShoeSizeMax: number = 13;
  public arrayShoeSize = [];

  constructor (
    public route: ActivatedRoute,
    public router: Router,
    public _orderService: OrderService,
    public _paxService: PassengerService,
    public _sellerService: UserService,
    public _countryService: CountryService,
    public archivoService: ArchivoService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {


    if (this.usuario === null) {      
       this.cambiaClase = 'large';
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
      // this.mostrarPasajeros(params.idorder);
      this.extraeArchivos(params.idorder);
      this.showCountries();
      /*if (this.mail === null) {
        return this.router.navigate(['/login']);
      } else {
        this.verificaVendedor(params.idorder);
      }
      }*/
    });

    // ==================================================
    // Cargamos el array para el selector de anio de nacimiento
    let n: number;
    for (n = 0; n < this.aniosMaximoNacimiento; n++) {
      this.arraySelectNacimiento[n] = this.anioInicialNacimiento;
      this.anioInicialNacimiento--;
    }
    // ==================================================
    // Cargamos el array para el selector de anio de expiracion
    let e: number;
    for (e = 0; e < this.aniosMaximoExpiracion; e++) {
      this.arraySelectExpiracion[e] = this.anioInicialExpiracion;
      this.anioInicialExpiracion++;
    }
    // ==================================================
    // Cargamos el array para el selector de talla de calzado
    let s: number;
    for (s = 0; s < this.usShoeSizeMax-2; s++) {
      this.arrayShoeSize[s] = this.usShoeSizeMin;
      this.usShoeSizeMin++;
    }
    // ==================================================
  }


  tiempoEdit(fecha) {
    if (fecha === undefined || fecha === null ) {
      this.tiempo = false;
    } else {
      const fechaSegundos = new Date(fecha);
      const fechaLimite = fechaSegundos.getTime() - 172800000;
      let fechaActual = new Date().getTime();
      let distancia = fechaLimite - fechaActual;
      if (distancia >= 500) {
        this.tiempo = false;
        console.log('Distancia: ' + distancia + 'valor: ' + this.tiempo);
      } else {
        this.tiempo = true;
        console.log('tiempo agotado' + '   valor: ' + this.tiempo);
      }

      const x = setInterval( () => {
        fechaActual = new Date().getTime();
        distancia = fechaLimite - fechaActual;
        if (distancia < 500) {
          this.tiempo = true;
          clearInterval(x);
        }
      }, 1000);
    }
  }

  verificaVendedor( order: string ) {
    this._orderService.obtenerOrder( order ).subscribe(
      (orderVerifica: Order) => {
        for (const seller of this.sellers) {
          if ( Number(seller.id) === Number(orderVerifica.sales_agent_id) ) {
            if (seller.mailseller === this.mail) {
              console.log('correcto');
              this.cargarCabeceraOrder(order);
              this.mostrarPasajeros(order);
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
        console.log('Posee TM.?: ' + this.order.tm_date_cruise);
        this.tiempoEdit(this.order.tm_date_cruise);
        this.codeSeller = this.order.sales_agent_id;
        this.numberPaxs = order.number_pax;
        this.mostrarPasajeros( id );
        this.mostrarDatosVendedor( this.codeSeller );
        // this.countdownOrder( this.order.tm_date_cruise );
      });
  }

  mostrarPasajeros( idOrder: string) {
    this._paxService.listadoPasajeros( idOrder )
      .subscribe( paxs => {
        this.listPassengers = paxs;

        // =======================================================================
        // == Se realiza el proceso de Desencriptar los datos de los pax
        let p: number;
        for (p = 0; p < Number(this.numberPaxs); p++) {
          let pasajero: Passenger;
          pasajero = this.listPassengers[p];
          pasajero.pax_first_name = this.deEncryptPax(pasajero.pax_first_name.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_last_name = this.deEncryptPax(pasajero.pax_last_name.trim(), this.listPassengers[p]['key_encrypt'] );
          /*pasajero.pax_title = this.deEncryptPax(pasajero.pax_title.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_nationality = this.deEncryptPax(pasajero.pax_nationality.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_date_month = this.deEncryptPax(pasajero.pax_date_month.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_date_day = this.deEncryptPax(pasajero.pax_date_day.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_date_year = this.deEncryptPax(pasajero.pax_date_year.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_passport = this.deEncryptPax(pasajero.pax_passport.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_passport_exp_month = this.deEncryptPax(pasajero.pax_passport_exp_month.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_passport_exp_day = this.deEncryptPax(pasajero.pax_passport_exp_day.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_passport_exp_year = this.deEncryptPax(pasajero.pax_passport_exp_year.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_emergency_contact = this.deEncryptPax(pasajero.pax_emergency_contact.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_marital_status = this.deEncryptPax(pasajero.pax_marital_status.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_arrival_flight = this.deEncryptPax(pasajero.pax_arrival_flight.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_departure_flight = this.deEncryptPax(pasajero.pax_departure_flight.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_insurance_company = this.deEncryptPax(pasajero.pax_insurance_company.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_insurance_number = this.deEncryptPax(pasajero.pax_insurance_number.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_contact_hotel = this.deEncryptPax(pasajero.pax_contact_hotel.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_restrictions = this.deEncryptPax(pasajero.pax_restrictions.trim(), this.listPassengers[p]['key_encrypt'] );
          pasajero.pax_type_acomm = this.deEncryptPax(pasajero.pax_type_acomm.trim(), this.listPassengers[p]['key_encrypt'] );*/

          console.log('DESENCRIPTADO:-------------- ');
          console.log( pasajero );

          this.listPassengers[p] = pasajero;
        }
        // =======================================================================

        // console.log( this.listPassengers );
      });
  }

  actualizarPasajeros( formulario: NgForm ) {
    // console.log( this.numberPaxs );

    console.log( formulario.value );
    if ( formulario.valid ) {
      console.log('<<<<<<<< =============================================== >>>>>>>>');
      this._orderService.actualizarOrder( this.order._id, this.order ).subscribe( resorder => {
          console.log('>>>>>>>> Se actualizo Cabecera Booking ');
          let p: number;
          for (p = 0; p < Number(this.numberPaxs); p++) {
            // console.log(this.listPassengers[p]);
            let pasajero: Passenger;
            // pasajero = this.listPassengers[p];

            pasajero = this.encryptPax( this.listPassengers[p] );

            console.log('pasajero: ');
            console.log( pasajero );
            // console.log( this.listPassengers[p]['_id'] );
            this._paxService.actualizarPasajero( this.listPassengers[p]['_id'], pasajero ).subscribe( respax => {
              console.log(':: Se actualizaron los datos del pax ' + p );
            });
          }
          this.guardaArchivos();
          this.router.navigate(['/success-booking' ]);
        });
    } else {
      return false;
    }
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

 async agregaInput(archivo: File) {
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

        const blob = nuevoArchivo._file;
        var a = document.createElement("a");
        try {
          const { default: heic2any } = await import('heic2any');
            const auxblob = await heic2any({
            blob,
            toType: "image/gif",
          });
    
          const filename = blob.name + ".gif";
          // this.saveFile(auxblob, filename);
          nuevoArchivo._file = this.blobToFile(auxblob, filename);
        } catch (error) {}
    

        if ( nuevoArchivo._file.size < 10485760 ) { // temporalmente se lo subio a 3Mb
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
          this.archivosSubidos.push({file_id_order: this.order._id, file_name: nuevoArchivo.file.name, file_name_user: archivo.name,
            file_size: (( archivo.size / 1024 / 1024).toFixed(2) + ' MB' ), file_status: '1', 'estado': true });
        }

        extPermitida = true;
      }
    }
    if (!extPermitida) {
      alert('Tipo de archivo no permitido');
    }
  }
  blobToFile(theBlob: any, fileName: string): File {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }
  guardaArchivos() {
    for (const item2 of this.archivosTemporales.queue) {
      const varEncoded = this.getEncodedImage( item2.file.name );
      this.archivoService.eliminaArchivoTemporal(item2.file.name).subscribe(
        (info: any) => {
          console.log(info);
          item2.isSuccess = false;
          item2.isUploaded = false;
          item2.file.name = 'file_' + item2.file.name;
          this.archivosTemporales.uploadAll();
          const archivo: FileO = { 
            'file_name': item2.file.name, 
            'file_name_user': item2._file.name,
            'file_size': (( item2.file.size / 1024 / 1024).toFixed(2) + ' MB' ), 
            'file_id_order': this.order._id
            // 'file_id_order': this.order._id, 
            // 'file_encode': varEncoded  
          };
          this.archivoService.crearArchivo(archivo).subscribe(
            (archivoGuardado: any) => {
              console.log(archivoGuardado);
            });
        });
    }
  }

  quitarArchivos() {
    let a: number;
    for ( a = 0; a < this.archivosSubidos.length ; a++) {
      this.cambiaEstado(this.archivosSubidos[a]._id);
    }
    for (const item2 of this.archivosTemporales.queue) {
      this.archivoService.eliminaArchivoTemporal(item2.file.name).subscribe(
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
    console.log(this.archivosTemporales.queue[item]);
    this.archivoService.eliminaArchivoTemporal(this.archivosTemporales.queue[item].file.name).subscribe(
      (info: any) => {
        console.log(info);
        this.archivosTemporales.removeFromQueue( item );
        this.archivosSubidos = [];
        this.extraeArchivos(this.order._id);
      });
  }

  extraeArchivos(order) {
    this.archivoService.listaArchivos(order).subscribe(
      (archivos: any) => {
        this.archivosSubidos = archivos.files;
        this.numArchivos = archivos.files.length;
        for (const item of this.archivosTemporales.queue) {
          this.archivosSubidos.push({file_id_order: this.order._id, file_name: item.file.name, file_name_user: item._file.name,
            file_size: (( item.file.size / 1024 / 1024).toFixed(2) + ' MB' ), file_status: '1', 'estado': true });
        }
        /** request completed */
        });
  }

  cambiaEstado(idArchivo) {
    console.log(idArchivo);
    let a: number;
    for ( a = 0; a < this.archivosSubidos.length ; a++) {
      // console.log(this.fileO[a]);
      if (this.archivosSubidos[a]._id === idArchivo) {
        this.archivosSubidos[a].file_status = '0';
        const fileA: FileO = this.archivosSubidos[a];
        this.archivoService.actualizarArchivo(idArchivo, fileA).subscribe(
          (archivos: any) => {
            this.archivosSubidos = [];
            this.extraeArchivos(this.order._id);
          });
      }
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
      }
    });
  }

  dialoQuitarArchivo(tipo, id) {
    const dialogo = this.dialog.open(DialogRemoveFileComponent, {
      height: '200px'
    });
    dialogo.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
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

  mostrarInsuranceInfo() {
    const dialogoInsu = this.dialog.open(DialogInsuranceInfoEditComponent, {
      height: '230px',
      width: '350px'
    });
  }

  mostrarPassportInfo() {
    const dialogoPass = this.dialog.open(DialogPassportInfoEditComponent, {
      height: '200px',
      width: '350px'
    });
  }

  // Obtener paises
  showCountries( ) {
    this._countryService.mostrarPaises()
      .subscribe( res_countries => {
        this.listCountries = res_countries.paises;
        this.listCountries.sort((a, b) => a.Name.localeCompare(b.Name)); // Oder by Name Asc
      });
  }

  // Metodo para validar numeros
  validarNumeros(e) {
    const tecla = (document.all) ? e.keyCode : e.which;
    if (tecla === 8) { return true; }
    const patron = /^[0-9]$/;
    const te = String.fromCharCode(tecla);
    return patron.test(te);
  }

  countdownOrder( dateCruise: Date ) {
    // =============================================================
    // Con esto obtenemos la fecha actual extendida para la expiracion
    // =============================================================
    /*const initialDate = new Date();
    const temp = new Date(initialDate);
    const ant= 1 * 86399.9; // dias en segundos
    const finalDate = new Date(temp.setSeconds(ant));
    const day = finalDate.getDate() < 10? '0' + finalDate.getDate(): finalDate.getDate();
    const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const finalDateFormat = day + ' ' + monthList[finalDate.getMonth()] + ', '  + finalDate.getFullYear();*/

    // =============================================================

    // Set the date we're counting down to
    // var countDownDate = new Date("Jul 25, 2018 15:37:25").getTime();
    // let countDownDate = finalDate.getTime();

    const countDownDate = new Date(dateCruise).getTime();

    // Update the count down every 1 second
    const x = setInterval(function() {

      // Get todays date and time
      const now = new Date().getTime();

      // Find the distance between now an the count down date
      const distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Output the result in an element with id="demo"
      // document.getElementById("demo").innerHTML = days + 'd ' + hours + 'h '
      //  + minutes + 'm ' + seconds + 's ';

      // console.log(days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ');
      if ( dateCruise !== undefined ) {
        // document.getElementById('countOrder').innerHTML = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';
      }


      // document.getElementById("expFecha").innerHTML = finalDateFormat;

      // If the count down is over, write some text
      if (distance < 0) {
        clearInterval(x);
        // document.getElementById("demo").innerHTML = 'EXPIRED';
        // document.getElementById('countOrder').innerHTML = 'EXPIRED';
      }
    }, 1000);
  }

  encryptPax ( pax: any) {
    // =======================================
    let password: string;

    let paxencrypt = new Passenger(
      '0',
      null,
      null,
      '0',
      '0',
      '0',
      '0',
      null,
      '0',
      '0',
      '0',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      "0",
      null,
      true,
      null
    );

    paxencrypt = pax;

    password = pax.key_encrypt;

    paxencrypt.pax_first_name = CryptoJS.AES.encrypt(pax.pax_first_name.trim(), password.trim()).toString();
    paxencrypt.pax_last_name = CryptoJS.AES.encrypt(pax.pax_last_name.trim(), password.trim()).toString();
    /*paxencrypt.pax_title = CryptoJS.AES.encrypt(pax.pax_title.trim(), password.trim()).toString();
    paxencrypt.pax_nationality = CryptoJS.AES.encrypt(pax.pax_nationality.trim(), password.trim()).toString();
    paxencrypt.pax_date_month = CryptoJS.AES.encrypt(pax.pax_date_month.trim(), password.trim()).toString();
    paxencrypt.pax_date_day = CryptoJS.AES.encrypt(pax.pax_date_day.trim(), password.trim()).toString();
    paxencrypt.pax_date_year = CryptoJS.AES.encrypt(pax.pax_date_year.trim(), password.trim()).toString();
    paxencrypt.pax_passport = CryptoJS.AES.encrypt(pax.pax_passport.trim(), password.trim()).toString();
    paxencrypt.pax_passport_exp_month = CryptoJS.AES.encrypt(pax.pax_passport_exp_month.trim(), password.trim()).toString();
    paxencrypt.pax_passport_exp_day = CryptoJS.AES.encrypt(pax.pax_passport_exp_day.trim(), password.trim()).toString();
    paxencrypt.pax_passport_exp_year = CryptoJS.AES.encrypt(pax.pax_passport_exp_year.trim(), password.trim()).toString();
    paxencrypt.pax_emergency_contact = CryptoJS.AES.encrypt(pax.pax_emergency_contact.trim(), password.trim()).toString();
    paxencrypt.pax_insurance_company = CryptoJS.AES.encrypt(pax.pax_insurance_company.trim(), password.trim()).toString();
    paxencrypt.pax_insurance_number = CryptoJS.AES.encrypt(pax.pax_insurance_number.trim(), password.trim()).toString();
    paxencrypt.pax_contact_hotel = CryptoJS.AES.encrypt(pax.pax_contact_hotel.trim(), password.trim()).toString();
    paxencrypt.pax_restrictions = CryptoJS.AES.encrypt(pax.pax_restrictions.trim(), password.trim()).toString();
    paxencrypt.pax_marital_status = CryptoJS.AES.encrypt(pax.pax_marital_status.trim(), password.trim()).toString();
    paxencrypt.pax_arrival_date = pax.pax_arrival_date;
    paxencrypt.pax_departure_date = pax.pax_departure_date;
    paxencrypt.pax_arrival_flight = CryptoJS.AES.encrypt(pax.pax_arrival_flight.trim(), password.trim()).toString();
    paxencrypt.pax_departure_flight = CryptoJS.AES.encrypt(pax.pax_departure_flight.trim(), password.trim()).toString();
    paxencrypt.pax_type_acomm = CryptoJS.AES.encrypt(pax.pax_type_acomm.trim(), password.trim()).toString();*/
    paxencrypt.pax_title = pax.pax_title;
    paxencrypt.pax_nationality = pax.pax_nationality;
    paxencrypt.pax_date_month = pax.pax_date_month;
    paxencrypt.pax_date_day = pax.pax_date_day;
    paxencrypt.pax_date_year = pax.pax_date_year;
    paxencrypt.pax_passport = pax.pax_passport;
    paxencrypt.pax_passport_exp_month = pax.pax_passport_exp_month;
    paxencrypt.pax_passport_exp_day = pax.pax_passport_exp_day;
    paxencrypt.pax_passport_exp_year = pax.pax_passport_exp_year;
    paxencrypt.pax_emergency_contact = pax.pax_emergency_contact;
    paxencrypt.pax_insurance_company = pax.pax_insurance_company;
    paxencrypt.pax_insurance_number = pax.pax_insurance_number;
    paxencrypt.pax_contact_hotel = pax.pax_contact_hotel;
    paxencrypt.pax_restrictions = pax.pax_restrictions;
    paxencrypt.pax_marital_status = pax.pax_marital_status;
    paxencrypt.pax_arrival_date = pax.pax_arrival_date;
    paxencrypt.pax_departure_date = pax.pax_departure_date;
    paxencrypt.pax_arrival_flight = pax.pax_arrival_flight;
    paxencrypt.pax_departure_flight = pax.pax_departure_flight;
    paxencrypt.pax_type_acomm = pax.pax_type_acomm;
    paxencrypt.pax_us_shoe_size = pax.pax_us_shoe_size;
    // =======================================
    return paxencrypt;
  }

  deEncryptPax ( paxParam: string, key: string) {
    const parameter = CryptoJS.AES.decrypt( paxParam, key );
    const returnParameter = parameter.toString(CryptoJS.enc.Utf8);
    return returnParameter;
  }

  getEncodedImage( fileName: String ) {
    for (const img of this.imagenTemp) {
      // console.log('==== ' + img['id']);
      if (img['id'] === fileName) {
        console.log('el img id  ' + img['id'] + ' es igual a item2 ' + fileName);
        this.encodeFile = img['data'].toString();
      }
    }
    return this.encodeFile;
  }
  setProcessAction(event: any) {
    console.log("numberFiles",  event.numberFiles);
    
    this.isLoading = event.isLoading;
    this.rowsLoading = event.numberFiles;
  }
}

@Component({
  standalone: false,
  selector: 'app-dialog-remove-files',
  templateUrl: './dialog-remove-files.component.html'
})
export class DialogRemoveFilesComponent {}

@Component({
  standalone: false,
  selector: 'app-dialog-remove-file',
  templateUrl: './dialog-remove-file.component.html'
})
export class DialogRemoveFileComponent {}

@Component({
  standalone: false,
  selector: 'app-dialog-insurance-info',
  templateUrl: './dialog-insurance-info.component.html'
})
export class DialogInsuranceInfoEditComponent {}

@Component({
  standalone: false,
  selector: 'app-dialog-passpoort-info',
  templateUrl: './dialog-passport-info.component.html'
})
export class DialogPassportInfoEditComponent {}

