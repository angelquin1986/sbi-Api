import { Component, OnInit } from "@angular/core";
import { Passenger } from "../../models/passenger.model";
import { ActivatedRoute, Router } from "@angular/router";
import { NgForm, FormControl } from "@angular/forms";
import { OrderService } from "../../services/order.service";
import { PassengerService } from "../../services/passenger.service";
import { Order } from "../../models/order.model";
import { SendmailModel } from "../../models/sendmail.model";
import { URL_SERVICIO_SENDMAIL, URL_SERVICIOS } from "../../config/config";
import { RequestTypes } from "../../shared/services/requestTypes";
import { GenericService } from "../../shared/services/generic.service";
import { UserService } from "../../services/user.service";
import { FileUploader, FileItem } from "ng2-file-upload";
import { MatDialog } from "@angular/material/dialog";
import { ArchivoService } from "../../services/archivo.service";
import { FileO } from "../../models/file.model";
import { CountryService } from "../../services/country.service";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";

import { environment } from "../../../environments/environment";

import * as CryptoJS from "crypto-js";

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from "moment";
import { Seller } from "../../models/seller.model";
// tslint:disable-next-line:no-duplicate-imports
// import {default as _rollupMoment} from 'moment';

const moment = _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: "LL",
  },
  display: {
    dateInput: "LL",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

const URL = URL_SERVICIOS + "/upload/";

@Component({
  standalone: false,
  selector: "app-booking",
  templateUrl: "./booking.component.html",
  styles: [
    `
      .mat-datepicker-toggle-active {
        color: #2a495b;
      }
    `,
  ],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  styleUrls: ["../../../assets/css/styles.css"],
})
export class BookingComponent implements OnInit {
  public sellers: Seller[];
  public archivosTemporales: FileUploader = new FileUploader({
    url: URL,
    itemAlias: "temporales",
  });
  public idOrder = Date.now();
  public imagenTemp: object[] = [];
  public sobreElemento = false;
  isLoading = false;
  rowsLoading: any[] = [];
  public date = new FormControl(moment());
  public minDateArrival = new Date();
  public minDateDeparture = new Date();

  public arreglo: any;
  public datoSeller: any;
  public mailSeller: string;
  public nameSeller: string;
  public listCountries: any;

  private urlSend = URL_SERVICIO_SENDMAIL;

  public mostrarLoading: boolean;
  public mostrarBotonSubmit: boolean;
  public mostrarAgentes: boolean;

  public listadoPasajeros: Array<Passenger>;
  public num_passenger: number;

  public fechaActual: Date = new Date();
  public horaActual: Date = new Date();
  public urls: string[];

  public nombreCompania = environment.nameCompany;
  public sitioCompania = environment.siteCompany;
  public urlCompania = environment.urlSiteCompany;
  public urlTermsCondi = environment.urlTermsCondi;

  public nameUser: string;
  public arrayPaxs = [];
  public arraySelectNacimiento = [];
  public arraySelectExpiracion = [];

  public encodeFile: string;

  public msgErrorExtensionFile: boolean;
  public msgErrorSizeFile: boolean;

  public anioActual: number = this.fechaActual.getFullYear(); 
  public aniosMaximoNacimiento: number = 100;
  public anioInicialNacimiento: number = this.anioActual;;
  public anioInicialExpiracion: number = this.anioActual;
  public aniosMaximoExpiracion: number = 20;

  public usShoeSizeMin: number = 3;
  public usShoeSizeMax: number = 13;
  public arrayShoeSize = [];


  order: Order = new Order(
    null,
    null,
    "0",
    "0",
    this.fechaActual,
    "0",
    null,
    null,
    null,
    null,
    null,
    null,
    null
  );

  public estructuraEnvio: SendmailModel = new SendmailModel();

  selectedImage: any;
  processedImages: any = [];
  showTitle: Boolean = false;

  constructor(
    public _orderService: OrderService,
    public _paxService: PassengerService,
    public _sellerService: UserService,
    public _countryService: CountryService,
    public activatedRoute: ActivatedRoute,
    public genericService: GenericService,
    public archivoService: ArchivoService,
    public dialog: MatDialog,
    public route: Router
  ) {
    this.activatedRoute.params.subscribe((parametros) => {
      this.num_passenger = 0;
      this.listadoPasajeros = new Array<Passenger>();
    });
  }
  ngOnInit() {
    this.mostrarAgentes = false;
    this.msgErrorSizeFile = false;
    this.msgErrorExtensionFile = false;
    this.activatedRoute.params.subscribe((parametros) => {
      if (parametros.id === undefined) {
        this.cargaUsuarios("1", "");
        this.mostrarAgentes = true;
      } else {
        this.cargaUsuarios("2", parametros.id);
      }
    });
    this.mostrarBotonSubmit = true;
    this.mostrarLoading = false;
    this.showCountries();
    this.getTimeSubmited();
    // ==================================================
    // Cargamos el array para el selector numero de pax
    let i: number;
    for (i = 0; i < 20; i++) {
      this.arrayPaxs[i] = i + 1;
    }
    // ==================================================
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

  cargaUsuarios(opcion, mail) {
    if (opcion === "1") {
      this._sellerService
          .getSellersCompany("gtc")
          .subscribe((usuarios: any) => {
            this.sellers = usuarios["usuarios"];
          });
     
    }
    if (opcion === "2") {
      const username = mail;
      this._sellerService
        .getSellerByUser(username)
        .subscribe((usuario: any) => {
          this.sellers = usuario["usuario"];
          this.order.sales_agent_id = this.sellers[0]["id"];
          this.nameUser = this.sellers[0]["nseller"];
        });
    }
  }

  validarNumeros(e) {
    const tecla = document.all ? e.keyCode : e.which;
    if (tecla === 8) {
      return true;
    }
    const patron = /^[0-9]$/;
    const te = String.fromCharCode(tecla);
    return patron.test(te);
  }

  onChange(newValue) {
    this.num_passenger = newValue;
    this.listadoPasajeros = new Array<Passenger>();
    let i: number;
    for (i = 1; i <= this.num_passenger; i++) {
      this.listadoPasajeros.push(
        new Passenger(
          "0",
          null,
          null,
          "0",
          "0",
          "0",
          "0",
          null,
          "0",
          "0",
          "0",
          null,
          "Single",
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          "Twin",
          "0",
          null,
          true,
          null
        )
      );
    }
    // console.log(this.listadoPasajeros);
  }

  registroForma(formulario: NgForm) {
    // console.log(formulario);
    // console.log(formulario.controls.sales_agent_id.status);
    // == Para comprobar si ingresa al metodo
    /*console.log("====================");
    console.log(formulario.value);
    console.log(this.order);*/
    // =============================================================================================================
    // Recorremos el arreglo de pasajeros y verificamos si todos los selects están seleccionados
    // =============================================================================================================
    let p: number;
    let parameterInValid: boolean;
    parameterInValid = false;
    for (p = 0; p < this.listadoPasajeros.length; p++) {
      let pasajero: any;
      pasajero = this.listadoPasajeros[p];
      if (
        pasajero.pax_title === "0" ||
        pasajero.pax_nationality === "0" ||
        pasajero.pax_date_month === "0" ||
        pasajero.pax_date_day === "0" ||
        pasajero.pax_date_year === "0" ||
        pasajero.pax_passport_exp_month === "0" ||
        pasajero.pax_passport_exp_day === "0" ||
        pasajero.pax_passport_exp_year === "0"
      ) {
        parameterInValid = true;
      }
    }
    // =============================================================================================================
    if (formulario.valid && !parameterInValid && this.num_passenger > 0) {
      this.mostrarLoading = true;
      this.mostrarBotonSubmit = false;
      console.log("========================================");
      // console.log( formulario );
      this._orderService.crearOrder(this.order).subscribe((resp) => {
        this.arreglo = resp;
        this.guardaArchivos();
        console.log("Se registra Cabecera Booking: ");
        // tslint:disable-next-line:no-shadowed-variable
        let p: number;
        for (p = 0; p < this.listadoPasajeros.length; p++) {
          let pasajero: any;
          let pasajeroEncriptado: any;
          pasajero = this.listadoPasajeros[p];
          pasajero.pax_id_order = this.arreglo.order._id;
          console.log(pasajero);
          // ================================================================
          // === Verificamos si en el objeto tiene true en el parametro de encriptacion
          if (pasajero.data_encrypt) {
            // console.log("SI ENTROOOO");
            pasajeroEncriptado = this.encryptPax(pasajero);
          } else {
            // console.log("NO ENTROOOO");
            pasajeroEncriptado = pasajero;
          }
          // ================================================================

          /*this._paxService.crearPasajero( pasajero )
              .subscribe( respax => {
                console.info('Se registro el pax ' + p + ' del order # ' + this.arreglo.order._id);
              });*/
          this._paxService
            .crearPasajero(pasajeroEncriptado)
            .subscribe((respax) => {
              console.log(
                "Se registro el pax " +
                  p +
                  " del order # " +
                  this.arreglo.order._id
              );
            });
        }
        this.procesarEnvio();
      });
    } else {
      console.log("NO SE PROCESO EL FORMULARIO");
      return false;
    }
    // console.log( formulario.valid );
    // console.log( formulario.value );
  }

  /*Asignacion de Variables al Objeto Json para Envio de Datos */
  crearInfoEnvio(): string {
    // Por el momento se está colcando en el parametro email/emails datos por defecto hasta definir a quienes van
    let varCompany: string;
    varCompany = "gtc";
    this.estructuraEnvio.datosSendMail = {
      email: this.mailSeller,
      type: 3,
      // 'subject': 'Secure Booking Information: TM Register:: ' + this.arreglo.order._id + '',
      subject:
        "Secure Booking Information :: " +
        this.arreglo.order.contact_person_name +
        "X" +
        this.arreglo.order.number_pax,
      urls: [
        this.urlCompania + "/sbi/edit/" + this.arreglo.order._id,
        this.urlCompania + "/sbi/report/pdf/" + this.arreglo.order._id,
        this.urlCompania + "/sbi/report/xls/" + this.arreglo.order._id,
      ],
      contact: this.arreglo.order.contact_person_name,
      receiver: this.nameSeller,
      emails: [],
      company: varCompany,
    };
    console.log(this.estructuraEnvio.datosSendMail);
    return this.estructuraEnvio.datosSendMail;
  }

  cargarEnvio() {
    this.genericService
      .Request(RequestTypes.post, this.urlSend, this.crearInfoEnvio(), null)
      .subscribe(
        (res) => {
          this.route.navigate(["/success-booking"]);

          console.log(res);
        },
        (error) => {
          console.log(error);
        },
        () => {}
      );
  }
  // Metodo para cargar el json de datos y envio al correo
  procesarEnvio() {
    console.log(">>>>>>>> entra para procesar ....");
    this.cargarInfoVendedor(this.arreglo.order.sales_agent_id);
  }
  // Agrega archivo al temporal mediante el input
  async agregaInput(archivo: File) {
    this.isLoading = true;
    this.rowsLoading = [1];
    const nuevoArchivo = new FileItem(this.archivosTemporales, archivo, {} as any);
    const dividirNombre = nuevoArchivo.file.name.split(".");
    const extArchivo = dividirNombre[dividirNombre.length - 1];
    nuevoArchivo.file.name = this.idOrder + "_" + Date.now() + "." + extArchivo;

    /*this.archivosTemporales.queue.push(nuevoArchivo);
    this.archivosTemporales.uploadAll();
    this.almacenaImagen(nuevoArchivo);*/

    // console.log(nuevoArchivo);}
    // Condicionante que valida que el archivo a subir no pese mas de 1.5 Mb (1572864 bytes)
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

    if (nuevoArchivo._file.size < 10485760) {
      // temporalmente se lo subio a 10Mb
      // console.log('El tamaño es aceptable');
      this.msgErrorSizeFile = false;
    } else {
      // console.log('El tamaño NO aceptable');
      this.msgErrorSizeFile = true;
    }
    // Condicionante que valida que el archivo tenga extensiones indicadas para subir
    if (
      extArchivo === "jpg" ||
      extArchivo === "jpeg" ||
      extArchivo === "png" ||
      extArchivo === "JPG" ||
      extArchivo === "PNG"
    ) {
      // console.log('extension archivo valido');
      this.msgErrorExtensionFile = false;
    } else {
      // console.log('extension archivo NO valido');
      this.msgErrorExtensionFile = true;
    }

    if (
      this.msgErrorSizeFile === false &&
      this.msgErrorExtensionFile === false
    ) {
      // console.log('Almacena el archivo temporalmente antes de registrarlo');
      this.archivosTemporales.queue.push(nuevoArchivo);
      this.archivosTemporales.uploadAll();
      this.almacenaImagen(nuevoArchivo);
      this.isLoading = false;
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
  saveFile(blob, filename) {
    const nav = window.navigator as any;
    if (nav.msSaveOrOpenBlob) {
      nav.msSaveOrOpenBlob(blob, filename);
    } else {
      var a = document.createElement("a");
      document.body.appendChild(a);
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(function () {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0);
    }
  }
  almacenaImagen(archivo: FileItem) {
    if (archivo.file.type.indexOf("image") >= 0) {
      const reader = new FileReader();
      const urlTemp = reader.readAsDataURL(archivo._file);
      reader.onloadend = () => {
        this.imagenTemp.push({ id: archivo.file.name, data: reader.result });
        // this.encodeFile = reader.result.toString();
        // console.log(this.encodeFile);
      };
      // console.log('DATA::: ');
      // console.log(this.imagenTemp);
    }
  }

  muestraImagen(nombreArchivo) {
    for (const img of this.imagenTemp) {
      if (img["id"] === nombreArchivo) {
        return img["data"];
      }
    }
  }

  guardaArchivos() {
    for (const item2 of this.archivosTemporales.queue) {
      // console.log('++++ ' + nombreArchivo);
      //const varEncoded = this.getEncodedImage(item2.file.name);
      const varEncoded = "";
      this.archivoService
        .eliminaArchivoTemporal(item2.file.name)
        .subscribe((info: any) => {
          console.log(info);
          item2.isSuccess = false;
          item2.isUploaded = false;
          const dividirNombre = item2.file.name.split("_");
          const nombreArchivo = dividirNombre[dividirNombre.length - 1];
          item2.file.name =
            "file_" + this.arreglo.order._id + "_" + nombreArchivo;

          this.archivosTemporales.uploadAll();
          const archivo: FileO = {
            file_name: item2.file.name,
            file_name_user: item2._file.name,
            file_size: (item2.file.size / 1024 / 1024).toFixed(2) + " MB",
            file_id_order: this.arreglo.order._id,
            // file_encode: varEncoded,
          };
          this.archivoService.crearArchivo(archivo).subscribe(
            // tslint:disable-next-line:no-shadowed-variable
            (info: any) => {
              console.log(info);
            }
          );
        });
    }
  }

  dialoQuitarArchivos() {
    const dialogo = this.dialog.open(RemoveFilesDialogComponent, {
      height: "200px",
    });
    dialogo.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        this.quitarArchivos();
      }
    });
  }

  mostrarInsuranceInfo() {
    const dialogoInsu = this.dialog.open(DialogInsuranceInfoComponent, {
      height: "230px",
      width: "350px",
    });
  }

  mostrarPassportInfo() {
    const dialogoPass = this.dialog.open(DialogPassportInfoComponent, {
      height: "200px",
      width: "350px",
    });
  }

  quitarArchivos() {
    for (const item2 of this.archivosTemporales.queue) {
      this.archivoService
        .eliminaArchivoTemporal(item2.file.name)
        .subscribe((info: any) => {
          console.log(info);
        });
    }
    this.archivosTemporales.clearQueue();
    this.imagenTemp = [];
  }

  dialoQuitarArchivo(tipo, id) {
    console.log(tipo);
    console.log(id);
    const dialogo = this.dialog.open(RemoveFileDialogComponent, {
      height: "200px",
    });

    dialogo.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        switch (tipo) {
          case "quita":
            this.quitarArchivo(id);
            break;
        }
      }
    });
  }

  quitarArchivo(item) {
    console.log(this.archivosTemporales.queue[item]);
    this.archivoService
      .eliminaArchivoTemporal(this.archivosTemporales.queue[item].file.name)
      .subscribe((info: any) => {
        console.log(info);
      });
    this.archivosTemporales.removeFromQueue(item);
  }

  cargarInfoVendedor(id: string) {
    this._sellerService.getInfoSeller(id).subscribe((resseller) => {
      this.datoSeller = resseller;
      // console.log( this.datoSeller.usuario[0]['mailseller'] );
      this.mailSeller = this.datoSeller.usuario[0]["mailseller"];
      this.nameSeller = this.datoSeller.usuario[0]["nseller"];

      // console.log(resseller);
      // console.log('---- ' + this.mailSeller);

      // Ejecutamos los metodos para el armado del json y envio del mail
      this.crearInfoEnvio();
      this.cargarEnvio();
    });
  }

  // Obtener paises
  showCountries() {
    this._countryService.mostrarPaises().subscribe((res_countries) => {
      this.listCountries = res_countries.paises;
      this.listCountries.sort((a, b) => a.Name.localeCompare(b.Name)); // Oder by Name Asc
    });
  }

  // Obtener la hora convertida de milisegundos
  getTimeSubmited() {
    const tmpHour =
      this.fechaActual.getHours() < 10
        ? "0" + this.fechaActual.getHours()
        : this.fechaActual.getHours();
    const tmpMin =
      this.fechaActual.getMinutes() < 10
        ? "0" + this.fechaActual.getMinutes()
        : this.fechaActual.getMinutes();
    const tmpSec =
      this.fechaActual.getSeconds() < 10
        ? "0" + this.fechaActual.getSeconds()
        : this.fechaActual.getSeconds();

    console.log(tmpHour + ":" + tmpMin + ":" + tmpSec);
  }

  encryptPax(pax: any) {
    // =======================================
    // tslint:disable-next-line:prefer-const
    let textToConvert: string;
    let password: string;
    // tslint:disable-next-line:prefer-const
    let conversionOutput: string;

    let paxencrypt = new Passenger(
      "0",
      null,
      null,
      "0",
      "0",
      "0",
      "0",
      null,
      "0",
      "0",
      "0",
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

    password =
      this.fechaActual.getFullYear().toString() +
      "-" +
      this.fechaActual.getMonth().toString() +
      "-" +
      this.fechaActual.getDate().toString();

    paxencrypt.key_encrypt = password;
    paxencrypt.pax_first_name = CryptoJS.AES.encrypt(
      pax.pax_first_name.trim(),
      password.trim()
    ).toString();
    paxencrypt.pax_last_name = CryptoJS.AES.encrypt(
      pax.pax_last_name.trim(),
      password.trim()
    ).toString();
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

    console.log("+++++++++++++++++++++++++++++++++");
    console.log(paxencrypt);
    // =======================================

    return paxencrypt;
  }

  mostrarSegurityInfo() {
    const dialogoPass = this.dialog.open(DialogSegurityInfoComponent, {
      height: "400px",
      width: "450px",
    });
  }

  getEncodedImage(fileName: String) {
    for (const img of this.imagenTemp) {
      // console.log('==== ' + img['id']);
      if (img["id"] === fileName) {
        console.log(
          "el img id  " + img["id"] + " es igual a item2 " + fileName
        );
        this.encodeFile = img["data"].toString();
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
  selector: "app-dialog-remove-files",
  templateUrl: "./dialog-remove-files.component.html",
})
export class RemoveFilesDialogComponent {}

@Component({
  standalone: false,
  selector: "app-dialog-remove-file",
  templateUrl: "./dialog-remove-file.component.html",
})
export class RemoveFileDialogComponent {}

@Component({
  standalone: false,
  selector: "app-dialog-insurance-info",
  templateUrl: "./dialog-insurance-info.component.html",
})
export class DialogInsuranceInfoComponent {}

@Component({
  standalone: false,
  selector: "app-dialog-passpoort-info",
  templateUrl: "./dialog-passport-info.component.html",
})
export class DialogPassportInfoComponent {}

@Component({
  standalone: false,
  selector: "app-dialog-segurity-info",
  templateUrl: "./dialog-segurity-info.component.html",
})
export class DialogSegurityInfoComponent {}
