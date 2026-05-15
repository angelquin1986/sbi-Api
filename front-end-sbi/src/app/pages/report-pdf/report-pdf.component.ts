import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { Seller } from '../../models/seller.model';
import { Passenger } from '../../models/passenger.model';
import { PassengerService } from '../../services/passenger.service';
import { jsPDF } from 'jspdf';
import { CountryService } from '../../services/country.service';
import { formatDate } from '@angular/common';
import { ArchivoService } from '../../services/archivo.service';
import { FileO } from '../../models/file.model';
import { URL_SERVICIOS } from '../../config/config';

import * as CryptoJS from 'crypto-js';

import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-report-pdf',
  templateUrl: './report-pdf.component.html',
  styles: []
})
export class ReportPDFComponent implements OnInit {

  @Input() orderID = null;
  public fechaExporta = new Date();
  public sellers: Seller[];
  public order: Order[];
  public archivos: FileO[];
  public pasajeros: Passenger[];
  public paises: any;

  public nombreCompania = environment.nameCompany;
  public sitioCompania = environment.siteCompany;
  public urlCompania = environment.urlSiteCompany;
  public urlServiceServer = environment.urlServicesServer;
  public urlLogo = environment.logoPdf;
  public subText = environment.subTextLogo;
  private imageDataURI: any;

  constructor(
    public route: ActivatedRoute,
    public usuarioService: UserService,
    public orderService: OrderService,
    public pasajeroService: PassengerService,
    public paisesService: CountryService,
    public archivosService: ArchivoService
  ) { }

  ngOnInit() {
    if (this.orderID === null) {
      this.cargaPaises();
      this.cargaUsuarios();
      this.route.params.subscribe(params => {
        this.cargaOrder(params.order);
        // this.cargaArchivos(params.order);
      });
    }
  }

  ejecutar() {
    // this.cargaArchivos(this.orderID);
    this.cargaPaises();
    this.cargaUsuarios();
    this.cargaOrder(this.orderID);
  }

  cargaUsuarios() {
    this.usuarioService.getSellersVendedor().subscribe(
      (usuarios: any) => {
        this.sellers = usuarios['usuarios'];
      });
  }

  cargaPaises() {
    this.paisesService.mostrarPaises().subscribe(
      (paises: any) => {
        this.paises = paises['paises'];
      });
  }

  cargaOrder(idOrder) {
    this.orderService.obtenerOrder(idOrder).subscribe(
      (order: Order[]) => {
        this.order = order;
        this.cargaArchivos(idOrder);
        // setTimeout(this.cargaPasajeros(idOrder), 4000);
      });
  }

  cargaArchivos(idOrder) {
    this.archivosService.listaArchivos(idOrder).subscribe(
      (archivos: FileO[]) => {
        this.archivos = archivos['files'];
        this.cargaPasajeros(idOrder);
        // console.log('aaa', archivos['files']);
        // setTimeout(this.exportaPDF(), 2000);
      });
  }

  cargaPasajeros(idOrder) {
    this.pasajeroService.listadoPasajeros(idOrder).subscribe(
      (pasajeros: Passenger[]) => {
        this.pasajeros = pasajeros;
        // console.log('PASAJEROS ', this.pasajeros);
        this.exportaPDF();
        // setTimeout(this.exportaPDF(), 8000);
      });
  }

  exportaPDF() {

    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const tipoLetra = 'Helvetica';
    const margen1 = 15;
    const margen2 = 48;
    const margen3 = 106;
    const margen4 = 145;
    const margen5 = 195;
    let saltolinea = 20;

    const salto = 7;
    pdf.setFont(tipoLetra, 'bold');
    pdf.setTextColor('#ccc');
    // console.log(URL_SERVICIOS + '/archivo/file/opciones/logo-gtc.jpg');
    // pdf.addImage(URL_SERVICIOS + '/archivo/file/opciones/logo-gtc.jpg' , 'JPEG', 150, saltolinea, 40, 12);
    // pdf.addImage(URL_SERVICIOS + '/archivo/file/doc_temporales/' + this.urlLogo , 'JPEG', 150, saltolinea, 40, 12);

    pdf.setFontSize(22);
    pdf.text((this.sitioCompania || '').toString(), margen1, saltolinea += salto);
    pdf.setFontSize(12);
    pdf.setFont(tipoLetra, 'italic');
    pdf.text((this.subText || '').toString(), margen1, saltolinea += 7);
    /*=================================================*/
    pdf.setFontSize(14);
    pdf.setFont(tipoLetra, 'bold');
    pdf.setTextColor('#666');
    pdf.text('Secure Booking Information', margen1, saltolinea += salto + 10);
    pdf.line(margen1, saltolinea += 2, margen5, saltolinea);
    const seller = this.sellers.find(sellerA => sellerA['id'] == this.order['sales_agent_id']);
    const pais = this.paises.find(paisA => paisA['Code'] == this.order['billing_country']);
    pdf.setFontSize(10);
    pdf.setTextColor('#000');
    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Sales agent: ', margen1, saltolinea += 10);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(seller.nseller, margen2, saltolinea);

    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Token #: ', margen3, saltolinea);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(this.order['_id'], margen4, saltolinea);
    pdf.text('(' + seller.mailseller + ')', margen2, saltolinea += salto);

    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Request date: ', margen3, saltolinea);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(formatDate(this.order['date_submited'], 'MMM dd, yyyy hh:mm a', 'en'), margen4, saltolinea);

    // const contact_person_name = pdf.splitTextToSize('Contact Person Name: ', 30);
    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Contact person: ', margen1, saltolinea += salto);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(this.order['contact_person_name'], margen2, saltolinea);

    const contact_person_mail = pdf.splitTextToSize(this.order['contact_person_mail'], 50);
    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Contact person e-mail: ', margen3, saltolinea);
    pdf.setFont(tipoLetra, 'normal');
    if (contact_person_mail.length >= 2) {
      pdf.setFontSize(8);
    }
    pdf.text(this.order['contact_person_mail'], margen4, saltolinea);


    pdf.setFontSize(14);
    pdf.setFont(tipoLetra, 'bold');
    pdf.setTextColor('#666');
    pdf.text('Billing Address', margen1, saltolinea += 5 + contact_person_mail.length * salto);
    pdf.line(margen1, saltolinea += 2, margen5, saltolinea);

    const billing_country = pdf.splitTextToSize(pais.Name + ' (' + this.order['billing_country'] + ')', 55);
    pdf.setFontSize(10);
    pdf.setTextColor('#000');
    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Country: ', margen1, saltolinea += 10);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(billing_country, margen2, saltolinea);

    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Telephone number: ', margen3, saltolinea);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(this.order['billing_phone'], margen4, saltolinea);

    if (billing_country.length >= 2) {
      saltolinea += (billing_country.length - 2) * salto;
    } else {
      saltolinea += billing_country.length * salto;
    }
    const billing_address = pdf.splitTextToSize(this.order['billing_address'], 50);
    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Street address: ', margen1, saltolinea += salto);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(billing_address, margen2, saltolinea);

    const billing_city = pdf.splitTextToSize(this.order['billing_city'], 50);
    pdf.setFont(tipoLetra, 'bold');
    pdf.text('City, State, Zip code: ', margen3, saltolinea);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(billing_city, margen4, saltolinea);

    if (billing_address.length >= billing_city.length) {
      saltolinea += billing_address.length * salto;
    } else {
      saltolinea += billing_city.length * salto;
    }

    pdf.setFontSize(14);
    pdf.setFont(tipoLetra, 'bold');
    pdf.setTextColor('#666');
    pdf.text('TM Information', margen1, saltolinea += 10);
    pdf.line(margen1, saltolinea += 2, margen5, saltolinea);

    if (this.order['tm_code'] === undefined || this.order['tm_code'] === null) {
      this.order['tm_code'] = '';
    }

    pdf.setFontSize(10);
    pdf.setTextColor('#000');
    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Code number: ', margen1, saltolinea += 10);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(this.order['tm_code'].toString(), margen2, saltolinea);

    let tm_date_cruise = '';
    if (this.order['tm_date_cruise'] === undefined || this.order['tm_date_cruise'] === null) {
      tm_date_cruise = '';
    } else {
      tm_date_cruise = formatDate(this.order['tm_date_cruise'], 'MMM dd, yyyy hh:mm a', 'en');
    }
    pdf.setFont(tipoLetra, 'bold');
    pdf.text('Date Operation: ', margen3, saltolinea);
    pdf.setFont(tipoLetra, 'normal');
    pdf.text(tm_date_cruise, margen4, saltolinea);
    saltolinea += 5;

    pdf.setFontSize(8);
    pdf.setTextColor('#000');
    pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});

    // Impresion de Pasajeros

    if (this.pasajeros.length > 0) {
      let c = 1;
      for (const pasajero of this.pasajeros) {
        // const paisP = this.paises.find( paisA => paisA['Code'] === this.deEncryptPax( pasajero.pax_nationality.trim(), pasajero.key_encrypt.trim() ));
        const paisP = this.paises.find(paisA => paisA['Code'] === pasajero.pax_nationality);
        // pdf.text('n: ' + (100 ) , margen4 - 10 , 100 );
        if (saltolinea >= 240) {
          pdf.addPage();
          saltolinea = 20;
          pdf.setFontSize(8);
          pdf.setFont(tipoLetra, 'normal');
          pdf.setTextColor('#000');
          pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
        }
        pdf.setFontSize(14);
        pdf.setFont(tipoLetra, 'bold');
        pdf.setTextColor('#666');
        pdf.text('Passenger ' + c, margen1, saltolinea += 10);
        pdf.line(margen1, saltolinea += 2, margen5, saltolinea);

        pdf.setFontSize(10);
        pdf.setTextColor('#000');
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('First Name: ', margen1, saltolinea += 10);
        pdf.setFont(tipoLetra, 'normal');
        // const pax_first_name = pdf.splitTextToSize(this.deEncryptPax( pasajero.pax_title.trim(), pasajero.key_encrypt.trim() ) + ' ' + this.deEncryptPax( pasajero.pax_first_name.trim(), pasajero.key_encrypt.trim()  ), 50);
        const pax_first_name = pdf.splitTextToSize(pasajero.pax_title + ' ' + this.deEncryptPax(pasajero.pax_first_name.trim(), pasajero.key_encrypt.trim()), 50);
        pdf.text(pax_first_name, margen2, saltolinea);

        const pax_last_name = pdf.splitTextToSize(this.deEncryptPax(pasajero.pax_last_name.trim(), pasajero.key_encrypt.trim()), 50);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Last name: ', margen3, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        pdf.text(pax_last_name, margen4, saltolinea);

        if (pax_first_name.length >= pax_last_name.length) {
          saltolinea += billing_address.length * salto;
        } else {
          saltolinea += billing_city.length * salto;
        }

        // const pax_nationality = pdf.splitTextToSize(paisP.Name + ' (' + this.deEncryptPax( pasajero.pax_nationality.trim(), pasajero.key_encrypt.trim() ) + ')' , 55);
        const pax_nationality = pdf.splitTextToSize(paisP.Name + ' (' + pasajero.pax_nationality + ')', 55);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Nationality: ', margen1, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        pdf.text(pax_nationality, margen2, saltolinea);

        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Date of Birth: ', margen3, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        // pdf.text( this.deEncryptPax( pasajero.pax_date_month.trim(), pasajero.key_encrypt.trim() ) + ' ' + this.deEncryptPax( pasajero.pax_date_day.trim(), pasajero.key_encrypt.trim() ) + ', ' + this.deEncryptPax( pasajero.pax_date_year.trim(), pasajero.key_encrypt.trim() ) , margen4 , saltolinea);
        pdf.text(pasajero.pax_date_month + ' ' + pasajero.pax_date_day + ', ' + pasajero.pax_date_year, margen4, saltolinea);

        if (saltolinea >= 265) {
          pdf.addPage();
          saltolinea = 20;
          pdf.setFontSize(8);
          pdf.setFont(tipoLetra, 'normal');
          pdf.setTextColor('#000');
          pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
        } else {
          if (pax_nationality.length > 2) {
            saltolinea += (pax_nationality.length - 2) * salto;
          } else {
            saltolinea += pax_nationality.length * salto;
          }
        }
        pdf.setFontSize(10);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Passport number: ', margen1, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        // pdf.text( this.deEncryptPax( pasajero.pax_passport.trim(), pasajero.key_encrypt.trim() ), margen2, saltolinea);
        pdf.text(pasajero.pax_passport, margen2, saltolinea);

        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Passport expiration', margen3, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        // pdf.text( this.deEncryptPax( pasajero.pax_passport_exp_month.trim(), pasajero.key_encrypt.trim() ) + ' ' + this.deEncryptPax( pasajero.pax_passport_exp_day.trim(), pasajero.key_encrypt.trim() ) + ', ' + this.deEncryptPax( pasajero.pax_passport_exp_year.trim(), pasajero.key_encrypt.trim() ), margen4 , saltolinea);
        pdf.text(pasajero.pax_passport_exp_month + ' ' + pasajero.pax_passport_exp_day + ', ' + pasajero.pax_passport_exp_year, margen4, saltolinea);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('date: ', margen3, saltolinea += 4);

        if (saltolinea >= 265) {
          pdf.addPage();
          saltolinea = 20;
          pdf.setFontSize(8);
          pdf.setFont(tipoLetra, 'normal');
          pdf.setTextColor('#000');
          pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
        }
        pdf.setFontSize(10);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Marital Status: ', margen1, saltolinea += salto);
        pdf.setFont(tipoLetra, 'normal');
        // pdf.text( this.deEncryptPax( pasajero.pax_marital_status.trim(), pasajero.key_encrypt.trim() ), margen2, saltolinea);
        pdf.text(pasajero.pax_marital_status, margen2, saltolinea);

        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Emergency Contact: ', margen3, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        // const pax_emergency_contact = pdf.splitTextToSize( this.deEncryptPax( pasajero.pax_emergency_contact.trim(), pasajero.key_encrypt.trim() ), 50);
        const pax_emergency_contact = pdf.splitTextToSize(pasajero.pax_emergency_contact, 50);
        pdf.text(pax_emergency_contact, margen4, saltolinea);

        if (saltolinea >= 265) {
          pdf.addPage();
          saltolinea = 20;
          pdf.setFont(tipoLetra, 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor('#000');
          pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
        }
        pdf.setFontSize(10);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Arrival in Ecuador: ', margen1, saltolinea += pax_emergency_contact.length * salto);
        pdf.setFont(tipoLetra, 'normal');
        pdf.text(formatDate(pasajero.pax_arrival_date, 'MMM dd, yyyy', 'en'), margen2, saltolinea);
        // pdf.text(formatDate(pasajero.pax_arrival_date, 'MMM dd, yyyy hh:mm a ', 'en'), margen2, saltolinea);


        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Arrival flight number: ', margen3, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        // pdf.text( this.deEncryptPax( pasajero.pax_arrival_flight.trim(), pasajero.key_encrypt.trim() ) , margen4 , saltolinea);
        pdf.text(pasajero.pax_arrival_flight !== null ? pasajero.pax_arrival_flight : '', margen4, saltolinea);

        if (saltolinea >= 265) {
          pdf.addPage();
          saltolinea = 20;
          pdf.setFontSize(8);
          pdf.setFont(tipoLetra, 'normal');
          pdf.setTextColor('#000');
          pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
        }
        pdf.setFontSize(10);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Departure from  ', margen1, saltolinea += salto);
        pdf.setFont(tipoLetra, 'normal');
        pdf.text(formatDate(pasajero.pax_departure_date, 'MMM dd, yyyy', 'en'), margen2, saltolinea);
        // pdf.text(formatDate(pasajero.pax_departure_date, 'MMM dd, yyyy hh:mm a', 'en'), margen2, saltolinea);

        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Departure flight ', margen3, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        // pdf.text( this.deEncryptPax( pasajero.pax_departure_flight.trim(), pasajero.key_encrypt.trim() ) , margen4 , saltolinea);
        pdf.text(pasajero.pax_departure_flight !== null ? pasajero.pax_departure_flight : '', margen4, saltolinea);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Ecuador: ', margen1, saltolinea += 4);
        pdf.text('number: ', margen3, saltolinea);

        if (saltolinea >= 255) {
          pdf.addPage();
          saltolinea = 20;
          pdf.setFontSize(8);
          pdf.setFont(tipoLetra, 'normal');
          pdf.setTextColor('#000');
          pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
        }

        if (pasajero.pax_type_acomm === undefined || pasajero.pax_type_acomm === null) {
          pasajero.pax_type_acomm = '';
        }
        // const pax_type_acomm = pdf.splitTextToSize( this.deEncryptPax( pasajero.pax_type_acomm.trim(), pasajero.key_encrypt.trim() ), 50);
        const pax_type_acomm = pdf.splitTextToSize(pasajero.pax_type_acomm, 50);
        pdf.setFontSize(10);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Type Accom.', margen1, saltolinea += salto);
        pdf.setFont(tipoLetra, 'normal');
        pdf.text(pax_type_acomm, margen2, saltolinea);

        if (saltolinea >= 255) {
          pdf.addPage();
          saltolinea = 20;
          pdf.setFontSize(8);
          pdf.setFont(tipoLetra, 'normal');
          pdf.setTextColor('#000');
          pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
        }

        if (pasajero.pax_insurance_company === undefined || pasajero.pax_insurance_company === null) {
          pasajero.pax_insurance_company = '';
        }
        // const pax_insurance_company = pdf.splitTextToSize( this.deEncryptPax( pasajero.pax_insurance_company.trim(), pasajero.key_encrypt.trim() ), 50);
        const pax_insurance_company = pdf.splitTextToSize(pasajero.pax_insurance_company, 50);
        pdf.setFontSize(10);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Travel Insurance', margen1, saltolinea += salto);
        pdf.setFont(tipoLetra, 'normal');
        pdf.text(pax_insurance_company, margen2, saltolinea);

        if (pasajero.pax_insurance_number === undefined || pasajero.pax_insurance_number === null) {
          pasajero.pax_insurance_number = '';
        }
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Travel Insurance', margen3, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        // pdf.text( this.deEncryptPax( pasajero.pax_insurance_number.trim(), pasajero.key_encrypt.trim() ), margen4 , saltolinea);
        pdf.text(pasajero.pax_insurance_number, margen4, saltolinea);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Company: ', margen1, saltolinea += 4);
        pdf.text('number: ', margen3, saltolinea);

        if (saltolinea >= 245) {
          pdf.addPage();
          saltolinea = 20;
          pdf.setFont(tipoLetra, 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor('#000');
          pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
        }
        if (pasajero.pax_contact_hotel === undefined || pasajero.pax_contact_hotel === null) {
          pasajero.pax_contact_hotel = '';
        }

        // const pax_contact_hotel = pdf.splitTextToSize( this.deEncryptPax( pasajero.pax_contact_hotel.trim(), pasajero.key_encrypt.trim() ), 50);
        const pax_contact_hotel = pdf.splitTextToSize(pasajero.pax_contact_hotel !== null ? pasajero.pax_contact_hotel : '', 50);
        pdf.setFontSize(10);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Hotel Contact ', margen1, saltolinea += salto);
        pdf.setFont(tipoLetra, 'normal');
        pdf.text(pasajero.pax_contact_hotel, margen4, saltolinea);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('before cruise/tour: ', margen1, saltolinea += 4);

        if (pasajero.pax_restrictions === undefined || pasajero.pax_restrictions === null) {
          pasajero.pax_restrictions = '';
        }
        // const pax_restrictions = pdf.splitTextToSize( this.deEncryptPax( pasajero.pax_restrictions.trim(), pasajero.key_encrypt.trim() ), 50);
        const pax_restrictions = pdf.splitTextToSize(pasajero.pax_restrictions, 50);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('Food restrictions/', margen3, saltolinea);
        pdf.setFont(tipoLetra, 'normal');
        pdf.text(pax_restrictions, margen4, saltolinea);
        pdf.setFont(tipoLetra, 'bold');
        pdf.text('allergies/ disabilities: ', margen3, saltolinea += 4);


        if (pax_contact_hotel.length >= pax_restrictions.length) {
          if (pax_contact_hotel.length >= 2) {
            saltolinea += (pax_contact_hotel.length - 2) * 5;
          } else {
            saltolinea += pax_contact_hotel.length * salto;
            saltolinea -= 5;
          }
        } else {
          if (pax_restrictions.length >= 2) {
            saltolinea += (pax_restrictions.length - 2) * 5;
          } else {
            saltolinea += pax_restrictions.length * salto;
            saltolinea -= 5;
          }
        }
        c += 1;
      }
    }

    // Impresion de Archivos
    if (this.archivos.length > 0 ) {
      pdf.addPage();
      saltolinea = 20;
      pdf.setFontSize(8);
      pdf.setFont(tipoLetra, 'normal');
      pdf.setTextColor('#000');
      pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});

      pdf.setFontSize(14);
      pdf.setFont(tipoLetra, 'bold');
      pdf.setTextColor('#666');
      pdf.text('Attached files', margen1, saltolinea += 10);
      pdf.line(margen1, saltolinea += 2, margen5, saltolinea);
      // console.log(this.archivos);
      for (const archivo of this.archivos) {
        if (saltolinea  >= 240) {
          pdf.addPage();
          saltolinea = 20;
          pdf.setFontSize(8);
          pdf.setFont(tipoLetra, 'normal');
          pdf.setTextColor('#000');
          pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
        }
        pdf.setFontSize(10);
        pdf.setTextColor('#000');
        pdf.setFont(tipoLetra, 'bold');
        pdf.text(archivo.file_name_user, 100, saltolinea += 10, {align: 'center'});
        const ext = archivo.file_name.substring(archivo.file_name.indexOf('.'));
        const url = '';
        if (ext !== '.doc' && ext !== '.docx' && ext !== '.pdf') {

          // console.log(archivo.file_name);
          // ============================================================================
          // Se obtiene la url de la imagen alamcenada

          // Trae la imagen desde un servicio
          // url = URL_SERVICIOS + '/archivo/file/doc_almacenados/' + archivo.file_name;
          // pdf.addImage( url, ext.substring(1).toUpperCase(), 60, saltolinea += salto, 80, 100 );

          // Trae el código de la imagen para dibujar
          // const urlData = archivo.file_encode;
          const urlData = URL_SERVICIOS + '/archivo/file/doc_almacenados/' + archivo.file_name;
          if ( urlData != null ) {
            try {
              
              pdf.addImage( urlData, ext.substring(1).toUpperCase(), 60, saltolinea += salto, 80, 100 );
            } catch (error) {
              console.log("error", error);
              
            }
          }
          setTimeout(() => { saltolinea += 100; }, 3000);
        }
      }
    } else {
      pdf.setFontSize(8);
      pdf.setTextColor('#000');
      pdf.setFont(tipoLetra, 'normal');
      pdf.text('Exported in: ' + formatDate(this.fechaExporta, 'MMM dd, yyyy hh:mm a', 'en'), 200, 285, {align: 'right'});
    }

    pdf.save('File_' + this.order['_id'] + '.pdf');
  }

  deEncryptPax(paxParam: string, key: string) {
    const parameter = CryptoJS.AES.decrypt(paxParam, key);
    const returnParameter = parameter.toString(CryptoJS.enc.Utf8);
    return returnParameter;
  }

}
