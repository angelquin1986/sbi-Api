import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../../models/order.model';
import { ArchivoService } from '../../services/archivo.service';
import { FileO } from '../../models/file.model';
import { PassengerService } from '../../services/passenger.service';
import { CountryService } from '../../services/country.service';
import { OrderService } from '../../services/order.service';
import { Seller } from '../../models/seller.model';
import { Passenger } from '../../models/passenger.model';
import { UserService } from '../../services/user.service';
import * as XLSX from 'xlsx';

import * as CryptoJS from 'crypto-js';

@Component({
  standalone: false,
  selector: 'app-report-excel',
  templateUrl: './report-excel.component.html'
})
export class ReportExcelComponent implements OnInit {


  @Input() orderID = null;
  public sellers: Seller[];
  public order: Order[];
  public archivos: FileO[];
  public pasajeros: Passenger[];
  public paises: any;

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
        // this.cargaArchivos(params.order);
        this.cargaOrder(params.order);
      });
    }
  }

  ejecutar() {
    this.cargaPaises();
    this.cargaUsuarios();
    // this.cargaArchivos(this.orderID);
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
      });
    }

    cargaArchivos(idOrder) {
      this.archivosService.listaArchivos(idOrder).subscribe(
        (archivos: FileO[]) => {
          this.archivos = archivos['files'];
          this.cargaPasajeros(idOrder);
          console.log('aaa', archivos['files']);
      });
  }

  cargaPasajeros(idOrder) {
    this.pasajeroService.listadoPasajeros(idOrder).subscribe(
      (pasajeros: Passenger[]) => {
        this.pasajeros = pasajeros;
        this.exportaExcel();
        // setTimeout(this.exportaExcel(), 2000) ;
      });
  }

  exportaExcel() {
    const pais = this.paises.find(paisA => paisA['Code'] == this.order['billing_country']);
    const seller = this.sellers.find(sellerA => sellerA['id'] == this.order['sales_agent_id']);
    if (this.order && Object.keys(this.order).length > 0) {
      let np = 0;
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
      XLSX.utils.sheet_add_json(hojaCalculo, [], { header: encabezado, origin: 'A1' });
      for (const pasajero of this.pasajeros) {
        np += 1;
        const paisP = this.paises.find(paisA => paisA['Code'] === pasajero['pax_nationality']);
        // const paisP = this.paises.find( paisA => paisA['Code'] === this.deEncryptPax( pasajero.pax_nationality.trim(), pasajero.key_encrypt.trim() ));
        XLSX.utils.sheet_add_json(hojaCalculo, [
          {
            'TOKEN': this.order['_id'],
            'DATE SUBMITED': this.order['date_submited'],
            'CONTACT NAME': this.order['contact_person_name'],
            'CONTACT MAIL': this.order['contact_person_mail'],
            'AGENT': seller.nseller,
            'PASSENGERS': np,
            'COUNTRY': pais.Name + ' (' + this.order['billing_country'] + ')',
            'CITY': this.order['billing_city'],
            'ADDRESS': this.order['billing_address'],
            'PHONE': this.order['billing_phone'],
            'TM CODE': this.order['tm_code'],
            'OPERATION DATE': this.order['tm_date_cruise'],
            'PASSENGER ID': pasajero['_id'],
            // 'TITLE': this.deEncryptPax( pasajero['pax_title'].trim(), pasajero['key_encrypt'].trim() ),
            'TITLE': pasajero['pax_title'],
            'FIRST NAME': this.deEncryptPax(pasajero['pax_first_name'].trim(), pasajero['key_encrypt'].trim()),
            'LAST NAME': this.deEncryptPax(pasajero['pax_last_name'].trim(), pasajero['key_encrypt'].trim()),
            // 'NATIONALITY': paisP.Name + ' (' + this.deEncryptPax( pasajero['pax_nationality'].trim(), pasajero['key_encrypt'].trim() ) + ')',
            'NATIONALITY': paisP.Name + ' (' + pasajero['pax_nationality'] + ')',
            // 'DATE OF BIRTH': this.deEncryptPax( pasajero['pax_date_year'].trim(), pasajero['key_encrypt'].trim() ) + '-' + this.deEncryptPax( pasajero['pax_date_month'].trim(), pasajero['key_encrypt'].trim() ) + '-' + this.deEncryptPax( pasajero['pax_date_day'].trim(), pasajero['key_encrypt'].trim() ),
            'DATE OF BIRTH': pasajero['pax_date_year'] + '-' + pasajero['pax_date_month'] + '-' + pasajero['pax_date_day'],
            // 'PASSPORT': this.deEncryptPax( pasajero['pax_passport'].trim(), pasajero['key_encrypt'].trim() ),
            'PASSPORT': pasajero['pax_passport'],
            // 'PASSPORT EXPIRATION DATE': this.deEncryptPax( pasajero['pax_passport_exp_year'].trim(), pasajero['key_encrypt'].trim() ) + '-' + this.deEncryptPax( pasajero['pax_passport_exp_month'].trim(), pasajero['key_encrypt'].trim() ) + '-' + this.deEncryptPax( pasajero['pax_passport_exp_day'].trim(), pasajero['key_encrypt'].trim() ),
            'PASSPORT EXPIRATION DATE': pasajero['pax_passport_exp_year'] + '-' + pasajero['pax_passport_exp_month'] + '-' + pasajero['pax_passport_exp_day'],
            // 'EMERGENCY CONTACT': this.deEncryptPax( pasajero['pax_emergency_contact'].trim(), pasajero['key_encrypt'].trim() ),
            'EMERGENCY CONTACT': pasajero['pax_emergency_contact'],
            // 'MARITAL STATUS': this.deEncryptPax( pasajero['pax_marital_status'].trim(), pasajero['key_encrypt'].trim() ),
            'MARITAL STATUS': pasajero['pax_marital_status'],
            'ARRIVAL DATE': pasajero['pax_arrival_date'],
            // 'ARRIVAL FLIGHT': this.deEncryptPax( pasajero['pax_arrival_flight'].trim(), pasajero['key_encrypt'].trim() ),
            'ARRIVAL FLIGHT': pasajero['pax_arrival_flight'],
            'DEPARTURE DATE': pasajero['pax_departure_date'],
            // 'DEPARTURE FLIGHT': this.deEncryptPax( pasajero['pax_departure_flight'].trim(), pasajero['key_encrypt'].trim() ),
            'DEPARTURE FLIGHT': pasajero['pax_departure_flight'],
            // 'INSURANCE COMPANY': this.deEncryptPax( pasajero['pax_insurance_company'].trim(), pasajero['key_encrypt'].trim() ),
            'INSURANCE COMPANY': pasajero['pax_insurance_company'],
            // 'INSURANCE NUMBER': this.deEncryptPax( pasajero['pax_insurance_number'].trim(), pasajero['key_encrypt'].trim() ),
            'INSURANCE NUMBER': pasajero['pax_insurance_number'],
            // 'HOTEL CONTACT': this.deEncryptPax( pasajero['pax_contact_hotel'].trim(), pasajero['key_encrypt'].trim() ),
            'HOTEL CONTACT BEFORE CRUISE/TOUR': pasajero['pax_contact_hotel'],
            // 'RESTRICTIONS/ ALLERGIES': this.deEncryptPax( pasajero['pax_restrictions'].trim(), pasajero['key_encrypt'].trim() ),
            'RESTRICTIONS/ ALLERGIES': pasajero['pax_restrictions'],
            // 'TYPE ACCOMMODATION': this.deEncryptPax( pasajero['pax_type_acomm'].trim(), pasajero['key_encrypt'].trim() ),
            'TYPE ACCOMMODATION': pasajero['pax_type_acomm'],
          }], { header: encabezado, origin: -1, skipHeader: true });
      }
      const libro: XLSX.WorkBook = { Sheets: { 'data': hojaCalculo }, SheetNames: ['data'] };
      XLSX.writeFile(libro, 'File_' + this.order['_id'] + '.xlsx', { bookType: 'xlsx', bookSST: true, type: 'buffer' });
    }
  }

  deEncryptPax(paxParam: string, key: string) {
    const parameter = CryptoJS.AES.decrypt(paxParam, key);
    const returnParameter = parameter.toString(CryptoJS.enc.Utf8);
    return returnParameter;
  }
}
