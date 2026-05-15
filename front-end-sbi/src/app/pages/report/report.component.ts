import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import * as XLSX from 'xlsx';
import {Order} from '../../models/order.model';
import {Passenger} from '../../models/passenger.model';
import {UserService} from '../../services/user.service';
import {Seller} from '../../models/seller.model';
import {FindService} from '../../services/find.service';
import {PassengerService} from '../../services/passenger.service';
import {environment} from '../../../environments/environment';

import * as CryptoJS from 'crypto-js';

@Component({
  standalone: false,
  selector: 'app-report',
  templateUrl: './report.component.html',
})

export class ReportComponent implements OnInit {
  public orders: Order [] = [];
  public pasajeros: Passenger [] = [];
  public orderPasajeros: any [] = [];
  public mail = '';
  public idAgente = '0';
  public sellers: Seller [] = [];
  public seller: Seller [] = [];
  public sellerCompany: Seller [] = [];

  public nameCiaReportSellers = environment.nameCiaReportSellers;

  public listSellers: any;

  constructor( public route: ActivatedRoute,
               public orderService: FindService,
               public usuarioService: UserService,
               public pasajeroService: PassengerService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      setTimeout(() => this.listarVendedores(), 25);
      setTimeout(() => this.cargaUsuarios(), 10);
      setTimeout(() => this.infoUsuario(params), 20);
    });
  }

  cargaUsuarios() {
    this.usuarioService.getSellersVendedor().subscribe(
      (usuarios: any) => {
        this.sellers = usuarios['usuarios'];
      });
  }

  listarVendedores() {
    this.usuarioService.getSellersCompany(this.nameCiaReportSellers).subscribe(
      (sellers: any) => {
        this.sellerCompany = sellers['usuarios'];
        /*for ( let i = 0; i < this.sellerCompany.length; i++ ) {
          console.log('<<<< ' + this.sellerCompany[i]['id'] );
        }*/
      });
  }

  infoUsuario(params) {
    const email = atob(params.mail);
    console.log(email);
    this.usuarioService.getSeller(email).subscribe(
      (sellerInfo: any) => {
        if (sellerInfo['usuarios'].length > 0) {
          this.seller = sellerInfo['usuarios'];
          if (this.seller[0]['role'] === 'OPERACION_ROLE') {
            // this.idAgente = '0';
            this.idAgente = '';
            // console.log( this.idAgente + '-----' );
            // =======================================================
            // Concatenamos los id de los vendedores en una sola variable
            for ( let i = 0; i < this.sellerCompany.length; i++ ) {
              this.idAgente += this.sellerCompany[i]['id'].toString();
              if ( i < this.sellerCompany.length - 1 ) {
                this.idAgente += '-';
              }
              // console.log( this.sellerCompany[i]['id'] );
              // console.log( this.idAgente );
            }
            // =======================================================
          } else {
            this.idAgente = this.seller['0'].id;
            // console.log( '+++++++' );
          }
          // console.log('+***++**+***++=====' );
          setTimeout(() => this.consultaAgente(params), 150);

        } else {
          alert('Acceso no permitido');
        }
      });
  }

  consultaAgente( params ) {
    /*this.usuarioService.getSeller(params.mail).subscribe(
      (sellerInfo: any) => {
        this.seller = sellerInfo['usuarios'];*/
        this.orderPasajeros = [];
        this.pasajeros = [];
        const fInicio = params.finicio.substring(0, 4) + '-' + params.finicio.substring(4, 6) + '-' + params.finicio.substring(6, 8);
        const fFin = params.ffin.substring(0, 4) + '-' + params.ffin.substring(4, 6) + '-' + params.ffin.substring(6, 8);
        const tm  = params.tm;
        const nombreContacto = '0';
        // console.log('>>> ' + this.seller[0]['role'] + '/' + this.idAgente + '/' + fInicio + '/' + fFin + '/' + nombreContacto + '/' + tm);
        // ====================================================================================================================
        this.orderService.obtenerOrders(this.seller[0]['role'], this.idAgente, fInicio, fFin, nombreContacto, tm ).subscribe(
          (orders: any) => {
            this.orders = orders['orders'];
            const numOrders = this.orders.length;
            let i = 1;
            if (numOrders > 0 ) {
              for (const elemento of this.orders ) {
                this.pasajeroService.listadoPasajeros(elemento['_id']).subscribe(
                  (pasajeros: any) => {
                    this.pasajeros = pasajeros;
                    this.orderPasajeros.push( {order: elemento, pasajeros: this.pasajeros});
                    if (i === numOrders ) {
                      this.cambiaIdxNombre();
                      this.exportaExcel(this.orderPasajeros);
                    }
                    i += 1;
                  });
              }
            } else {
              alert('No hay Orders con los parámetros ingresados');
            }
          });
        // ====================================================================================================================
      // });
  }

  cambiaIdxNombre() {
    for ( const elemento of this.orderPasajeros) {
      for (const seller of this.sellers) {
        if (Number(seller.id) === elemento['order'].sales_agent_id) {
          elemento['order'].sales_agent_id = seller.nseller;
        }
      }
    }
  }

  exportaExcel(orderPasajeros) {
    if (orderPasajeros.length > 0 ) {
      const hojaCalculo = XLSX.utils.aoa_to_sheet([]);
      const encabezado = [
        'TOKEN',
        'DATE SUBMITED',
        'CONTACT NAME',
        'CONTACT MAIL',
        'AGENT',
        'PASSENGERS',
        'COUNTRY',
        'CITY',
        'PHONE',
        'ADDRESS',
        'TM CODE',
        'OPERATION DATE',
        'PASSENGER ID', // informacion pasajeros
        'TITLE',
        'FIRST NAME',
        'LAST NAME',
        'NATIONALITY',
        'DATE OF BIRTH',
        'PASSPORT',
        'PASSPORT EXPIRATION DATE',
        'EMERGENCY CONTACT',
        'MARITAL STATUS',
        'ARRIVAL DATE',
        'ARRIVAL FLIGHT',
        'DEPARTURE DATE',
        'DEPARTURE FLIGHT',
        'INSURANCE COMPANY',
        'INSURANCE NUMBER',
        'HOTEL CONTACT BEFORE CRUISE/TOUR',
        'RESTRICTIONS/ ALLERGIES',
        'TYPE ACCOMMODATION'
      ];
      XLSX.utils.sheet_add_json(hojaCalculo, [], {header: encabezado, origin: 'A1'});
      for (const elemento of orderPasajeros) {
        // console.log(elemento.order._id);
        let np = 0;
        for (const elemento2 of elemento['pasajeros']) {
          np += 1;
          XLSX.utils.sheet_add_json(hojaCalculo, [
            { 'TOKEN': elemento.order['_id'],
              'DATE SUBMITED': elemento.order['date_submited'],
              'CONTACT NAME': elemento.order['contact_person_name'],
              'CONTACT MAIL': elemento.order['contact_person_mail'],
              'AGENT': elemento.order['sales_agent_id'],
              'PASSENGERS': np,
              'COUNTRY': elemento.order['billing_country'],
              'CITY': elemento.order['billing_city'],
              'PHONE': elemento.order['billing_phone'],
              'ADDRESS': elemento.order['billing_address'],
              'TM CODE': elemento.order['tm_code'],
              'OPERATION DATE': elemento.order['tm_date_cruise'],
              'PASSENGER ID': elemento2['_id'],
              'FIRST NAME': this.deEncryptPax( elemento2['pax_first_name'].trim(), elemento2['key_encrypt'].trim() ),
              'LAST NAME': this.deEncryptPax( elemento2['pax_last_name'].trim(), elemento2['key_encrypt'].trim() ),
              'TITLE': elemento2['pax_title'],
              'NATIONALITY': elemento2['pax_nationality'],
              'DATE OF BIRTH': elemento2['pax_date_year'] + '-' + elemento2['pax_date_month'] + '-' +  elemento2['pax_date_day'],
              'PASSPORT': elemento2['pax_passport'],
              'PASSPORT EXPIRATION DATE': elemento2['pax_passport_exp_year'] + '-' + elemento2['pax_passport_exp_month'] + '-' + elemento2['pax_passport_exp_day'],
              'EMERGENCY CONTACT': elemento2['pax_emergency_contact'],
              'MARITAL STATUS': elemento2['pax_marital_status'],
              'ARRIVAL DATE': elemento2['pax_arrival_date'],
              'ARRIVAL FLIGHT': elemento2['pax_arrival_flight'],
              'DEPARTURE DATE': elemento2['pax_departure_date'],
              'DEPARTURE FLIGHT':  elemento2['pax_departure_flight'],
              'INSURANCE COMPANY': elemento2['pax_insurance_company'],
              'INSURANCE NUMBER': elemento2['pax_insurance_number'],
              'HOTEL CONTACT BEFORE CRUISE/TOUR': elemento2['pax_contact_hotel'],
              'RESTRICTIONS/ ALLERGIES': elemento2['pax_restrictions'],
              'TYPE ACCOMMODATION': elemento2['pax_type_acomm']
              /*'TITLE': this.deEncryptPax( elemento2['pax_title'].trim(), elemento2['key_encrypt'].trim() ),
              'NATIONALITY': this.deEncryptPax( elemento2['pax_nationality'].trim(), elemento2['key_encrypt'].trim() ),
              'DATE OF BIRTH': this.deEncryptPax( elemento2['pax_date_year'].trim(), elemento2['key_encrypt'].trim() ) + '-' + this.deEncryptPax( elemento2['pax_date_month'].trim(), elemento2['key_encrypt'].trim() ) + '-' + this.deEncryptPax( elemento2['pax_date_day'], elemento2['key_encrypt'].trim() ),
              'PASSPORT': this.deEncryptPax( elemento2['pax_passport'].trim(), elemento2['key_encrypt'].trim() ),
              'PASSPORT EXPIRATION DATE': this.deEncryptPax( elemento2['pax_passport_exp_year'].trim(), elemento2['key_encrypt'].trim() ) + '-' + this.deEncryptPax( elemento2['pax_passport_exp_month'].trim(), elemento2['key_encrypt'].trim() ) + '-' + this.deEncryptPax( elemento2['pax_passport_exp_day'].trim(), elemento2['key_encrypt'].trim() ),
              'EMERGENCY CONTACT': this.deEncryptPax( elemento2['pax_emergency_contact'].trim(), elemento2['key_encrypt'].trim() ),
              'MARITAL STATUS': this.deEncryptPax( elemento2['pax_marital_status'].trim(), elemento2['key_encrypt'].trim() ),
              'ARRIVAL DATE': elemento2['pax_arrival_date'],
              'ARRIVAL FLIGHT': this.deEncryptPax( elemento2['pax_arrival_flight'].trim(), elemento2['key_encrypt'].trim() ),
              'DEPARTURE DATE': elemento2['pax_departure_date'],
              'DEPARTURE FLIGHT': this.deEncryptPax( elemento2['pax_departure_flight'].trim(), elemento2['key_encrypt'].trim() ),
              'INSURANCE COMPANY': this.deEncryptPax( elemento2['pax_insurance_company'].trim(),elemento2['key_encrypt'].trim() ),
              'INSURANCE NUMBER': this.deEncryptPax( elemento2['pax_insurance_number'].trim(), elemento2['key_encrypt'].trim() ),
              'HOTEL CONTACT': this.deEncryptPax( elemento2['pax_contact_hotel'].trim(), elemento2['key_encrypt'].trim() ),
              'RESTRICTIONS/ ALLERGIES': this.deEncryptPax( elemento2['pax_restrictions'].trim(), elemento2['key_encrypt'].trim() )*/
            }], {header: encabezado, origin: -1, skipHeader: true});
        }
      }
      const libro: XLSX.WorkBook = { Sheets: { 'data': hojaCalculo }, SheetNames: ['data']};
      XLSX.writeFile(libro, 'exportOrders.xlsx', { bookType: 'xlsx', bookSST: true, type: 'buffer' });
    }
  }

  deEncryptPax ( paxParam: string, key: string) {
    let parameter = CryptoJS.AES.decrypt( paxParam, key );
    let returnParameter = parameter.toString(CryptoJS.enc.Utf8);
    return returnParameter;
  }

}
