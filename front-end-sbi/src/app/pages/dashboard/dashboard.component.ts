import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm, FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { FindService} from '../../services/find.service';
import { UserService} from '../../services/user.service';
import { Order} from '../../models/order.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {Seller} from '../../models/seller.model';
import {PassengerService} from '../../services/passenger.service';
import {Passenger} from '../../models/passenger.model';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import {CountryService} from '../../services/country.service';
import {environment} from '../../../environments/environment';
import { Platform } from '@angular/cdk/platform';
import {OrderService} from '../../services/order.service';


@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['../../../assets/css/stylesDashboard.css']
})
export class DashboardComponent implements OnInit {
  public mail = atob(localStorage.getItem('email'));
  public agenteSelect = '0';
  public tiempo = false;
  public muestraAgentes = false;
  public rolUsuario = '';
  public idAgente = '0';
  public idAgentes = '';
  public orders: Order [] = [];
  public seller: Seller [] = [];
  public sellerCompany: Seller [] = [];
  public pasajeros: Passenger [] = [];
  public nombreSeller = '';
  public paises: any;
  public options: FormGroup;
  public orderPasajeros: any [] = [];
  public datosDashboard: object = {'idAgente': '',
    'fInicio': '',
    'fFin': '',
    'nombreContacto': '',
    'tm': '',
    'token': ''
  };

  public displayedColumns: string[] = [
    '_id', 'contact_person_name', 'contact_person_mail', 'number_pax', 'date_submited',
    /*'billing_country', 'billing_city', 'billing_address', 'billing_phone',*/
    'tm_code', 'tm_date_cruise', 'options'];


  public nameCiaReportSellers = environment.nameCiaReportSellers;

  dataSource: MatTableDataSource<Order>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public status = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private usuarioService: UserService,
    private orderService: FindService,
    private pasajeroService: PassengerService,
    public paisesService: CountryService,
    public _orderService: OrderService,
    private cdr: ChangeDetectorRef,
    fb: FormBuilder
    ) {
      this.cargaPaises();
      this.listarVendedores();
      if (localStorage.getItem('inicio') === null) {
        localStorage.setItem('inicio', btoa(new Date().toString()));
        localStorage.setItem('fin', btoa(new Date().toString()));
        localStorage.setItem('contacto', btoa('0'));
        localStorage.setItem('tm', btoa('-'));
    }
    this.status = true;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (localStorage.getItem('email') === null || '') {
        this.cerrarSesion();
      } else {
        this.dataSource = new MatTableDataSource( this.orders);
        this.usuarioService.getSeller(this.mail).subscribe(
          (sellerInfo: any) => {
            this.seller = sellerInfo['usuarios'];
            localStorage.setItem('usuario', btoa(sellerInfo['usuarios']['0'].nseller));
            localStorage.setItem('rol', btoa(sellerInfo['usuarios']['0'].role));
            this.rolUsuario = sellerInfo['usuarios']['0'].role;
            this.nombreSeller = sellerInfo['usuarios']['0'].nseller;
            this.listarVendedores();

            this.cargaPaises();
            if (this.rolUsuario === 'OPERACION_ROLE' ) {
              this.muestraAgentes = true;
              this.displayedColumns = [
                '_id', 'sales_agent_id', 'contact_person_name', 'contact_person_mail',
                'number_pax', 'date_submited', /*'billing_country', 'billing_city', 'billing_address', 'billing_phone',*/
                'tm_code', 'tm_date_cruise', 'options'];
            } else {
              localStorage.setItem('agente', btoa(sellerInfo['usuarios']['0'].id));
            }

            if (localStorage.getItem('inicio') !== null || '') {
              this.cargarDatos();
            }
          },
          (_err) => { this.cargarDatos(); });
      }
    });
  }

  cargarDatos () {
    let contacto = '';
    let tm = '';
    if (atob(localStorage.getItem('contacto')) === '0') {
      contacto = '';
    } else {
      contacto = atob(localStorage.getItem('contacto'));
    }

    if (atob(localStorage.getItem('tm')) === '-') {
      tm = '';
    } else {
      tm = atob(localStorage.getItem('tm'));
    }

    const finicio = new Date(atob(localStorage.getItem('inicio')));
    finicio.setMonth(finicio.getMonth());
    console.log('fecha inicio', finicio);
    const ffin = new Date(atob(localStorage.getItem('fin')));
    console.log('fecha fin', ffin);
    this.datosDashboard = {
      'idAgente': this.rolUsuario === 'OPERACION_ROLE' ? '0' : atob(localStorage.getItem('agente')),
      'fInicio': finicio,
      'fFin': ffin,
      'nombreContacto': contacto,
      'tm': tm
    };
    this.agenteSelect = this.datosDashboard['idAgente'];
    this.extraeDatos(this.rolUsuario, this.agenteSelect === '0' ? this.idAgentes : this.agenteSelect, this.datosDashboard['fInicio'].toISOString().substring(0, 10),
    this.datosDashboard['fFin'].toISOString().substring(0, 10), atob(localStorage.getItem('contacto')), atob(localStorage.getItem('tm')));
    }


  tiempoEdit(fecha) {
    if ((fecha === undefined || fecha === null) && this.rolUsuario === 'VENDEDOR_ROLE' ) {
      this.tiempo = false;
    } else {
      const fechaSegundos = new Date(fecha);
      const fechaLimite = fechaSegundos.getTime() - 172800000;
      let fechaActual = new Date().getTime();
      let distancia = fechaLimite - fechaActual;
      if (distancia >= 0 && this.rolUsuario === 'VENDEDOR_ROLE') {
        this.tiempo = false;
      } else {
        this.tiempo = true;
      }
      const x = setInterval(function() {
        fechaActual = new Date().getTime();
        distancia = fechaLimite - fechaActual;
        if (distancia < 0) {
          clearInterval(x);
        }
      }, 1000);
    }
  }

  cargaUsuarios() {
    this.usuarioService.getSellersVendedor().subscribe(
      (usuarios: any) => {
        this.sellerCompany = usuarios['usuarios'];
      });
  }

  listarVendedores() {
    this.usuarioService.getSellersCompany(this.nameCiaReportSellers).subscribe(
      (sellers: any) => {
        this.sellerCompany = sellers['usuarios'];
        /*for ( let i = 0; i < this.sellerCompany.length; i++ ) {
          console.log('<<<< ' + this.sellerCompany[i]['id'] );
        }*/
        // =======================================================
        // Concatenamos los id de los vendedores en una sola variable
        for ( let i = 0; i < this.sellerCompany.length; i++ ) {
          this.idAgentes += this.sellerCompany[i]['id'].toString();
          if ( i < this.sellerCompany.length - 1 ) {
            this.idAgentes += '-';
          }
          // console.log( this.sellerCompany[i]['id'] );
          // console.log(this.idAgentes );
        }
        // =======================================================
      });
  }

  cargaPaises() {
    this.paisesService.mostrarPaises().subscribe(
      (paises: any) => {
        this.paises = paises['paises'];
      });
  }

  consultaAgente( forma: NgForm ) {
    this.status = true;
    this.cdr.detectChanges();
    const searchButton = <HTMLInputElement> document.getElementById('searchButton');
    searchButton.disabled = true;
    const excelButton = <HTMLInputElement> document.getElementById('excelButton');
    excelButton.disabled = true;
    if (atob(localStorage.getItem('email')) === null) {
      this.cerrarSesion();
    } else {
      this.orderPasajeros = [];
      this.pasajeros = [];
      if ( forma.form.status === 'VALID') {
        const fInicio = forma.value.fechaInicial.toISOString().substring(0, 10);
        const fFinTemp = new Date(forma.value.fechaFin);
        fFinTemp.setHours(fFinTemp.getHours() + 24);
        const fFin = fFinTemp.toISOString().substring(0, 10);
        let nombreContacto = forma.value.nombreContacto;
        let tm = forma.value.tm;
        let token = forma.value.token;
        if (forma.value.nombreContacto === '' || forma.value.nombreContacto === null) {
          nombreContacto = '0';
        }
        if (forma.value.tm === '') {
          tm = '-';
        }
        if (this.rolUsuario === 'OPERACION_ROLE') {
          this.idAgente = forma.value.agenteSelect;
        } else {
          this.idAgente = this.seller['0'].id;
        }
        localStorage.setItem('agente', btoa(this.idAgente));
        localStorage.setItem('inicio', btoa(forma.value.fechaInicial.toISOString()));
        localStorage.setItem('fin', btoa(forma.value.fechaFin.toISOString()));
        localStorage.setItem('contacto', btoa(nombreContacto));
        localStorage.setItem('tm', btoa(tm));
        localStorage.setItem('tk', btoa(forma.value.token));

        if (forma.value.token === '' || forma.value.token === undefined) {
          token = '';
        } else {
          token = forma.value.token;
        }

        if (token === '') {
          this.extraeDatos(this.rolUsuario, this.idAgente === '0' ? this.idAgentes : this.idAgente, fInicio, fFin, nombreContacto, tm);
        } else {
          this.extraeDatosOrder(forma.value.token);
        }
      }
    }
  }

  extraeDatos(rol, idAgente, fInicio, fFin, nombreContacto, tm) {
    this.orderService.obtenerOrders(rol, idAgente, fInicio, fFin, nombreContacto, tm).subscribe(
      (orders: any) => {
        this.orders = orders['orders'];
        if (orders['cant'] > 0) {
          this.cambiaIdxNombre();
        } else {
          this.dataSource = new MatTableDataSource( this.orders);
          this.dataSource.paginator = this.paginator;
          this.status = false;
          this.cdr.detectChanges();
          this.dataSource.sort = this.sort;
          const searchButton = <HTMLInputElement> document.getElementById('searchButton');
          if (searchButton) { searchButton.disabled = false; }
          const excelButton = <HTMLInputElement> document.getElementById('excelButton');
          if (excelButton) { excelButton.disabled = false; }
        }
      },
      (_err) => { this.status = false; this.cdr.detectChanges(); });
  }

  extraeDatosOrder(token) {
    this._orderService.obtenerOrder( token ).subscribe(
      (orders: any) => {
        this.orders = [];
        this.orders = [orders];
        if (orders.length > 0) {
          this.cambiaIdxNombre();
        } else {
          this.dataSource = new MatTableDataSource( this.orders);
          this.dataSource.paginator = this.paginator;
          this.status = false;
          this.cdr.detectChanges();
          this.dataSource.sort = this.sort;
          const searchButton = <HTMLInputElement> document.getElementById('searchButton');
          if (searchButton) { searchButton.disabled = false; }
          const excelButton = <HTMLInputElement> document.getElementById('excelButton');
          if (excelButton) { excelButton.disabled = false; }
        }
      },
      (_err) => { this.status = false; this.cdr.detectChanges(); });
  }

  aplicarFiltro(valorFiltro: string) {
    this.dataSource.filter = valorFiltro.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  cambiaIdxNombre() {
    for ( const elemento of this.orders) {
      for (const seller of this.sellerCompany) {
        if (seller.id.toString() === elemento.sales_agent_id.toString()) {
          elemento.sales_agent_id = seller.nseller;
        }
      }
    }
    this.dataSource = new MatTableDataSource( this.orders);
    this.dataSource.paginator = this.paginator;
    this.status = false;
    this.cdr.detectChanges();
    this.dataSource.sort = this.sort;
    const searchButton = <HTMLInputElement> document.getElementById('searchButton');
    if (searchButton) { searchButton.disabled = false; }
    const excelButton = <HTMLInputElement> document.getElementById('excelButton');
    if (excelButton) { excelButton.disabled = false; }
  }

  exportaExcel2 () {
    let cuenta = 0;
    for (const elemento of this.orders) {
      this.pasajeroService.listadoPasajeros(elemento['_id']).subscribe(
        (pasajeros: any) => {
          this.pasajeros = pasajeros;
          this.orderPasajeros.push({order: elemento, pasa: this.pasajeros});
          cuenta += 1;
          if ( cuenta >= this.orders.length) {
            this.exportaExcel();
          }
        });
    }
  }


  exportaExcel() {
    const hojaCalculo = XLSX.utils.aoa_to_sheet([]);
    const encabezado = [
      'ID',
      'DATE SUBMITED',
      'CONTACT NAME',
      'CONTACT MAIL',
      'AGENT',
      'PASSENGERS',
      'BILLING COUNTRY',
      'BILLING PHONE',
      'BILLING ADDRESS',
      'BILLING CITY',
      'TM CODE',
      'TM DATE OPERATION',
      'STATE ORDER',
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
      'HOTEL CONTACT',
      'RESTRICTIONS/ ALLERGIES'
    ];
    XLSX.utils.sheet_add_json(hojaCalculo, [], {header: encabezado, origin: 'A1'});
    for (const elemento of this.orderPasajeros) {
      const pais = this.paises.find( paisA => paisA['Code'] === elemento.order['billing_country']);
      for (const elemento2 of elemento['pasa']) {
        const paisP = this.paises.find( paisA => paisA['Code'] === elemento2['pax_nationality']);
        if (pais && elemento) {
          console.log('pais', pais);
          console.log('elemento', elemento);
          XLSX.utils.sheet_add_json(hojaCalculo, [
            { 'ID': elemento.order['_id'],
              'DATE SUBMITED': elemento.order['date_submited'],
              'CONTACT NAME': elemento.order['contact_person_name'],
              'CONTACT MAIL': elemento.order['contact_person_mail'],
              'AGENT': elemento.order['sales_agent_id'],
              'PASSENGERS': elemento.order['number_pax'],
              'BILLING COUNTRY': pais.Name + ' (' + elemento.order['billing_country'] + ')',
              'BILLING PHONE': elemento.order['billing_phone'],
              'BILLING ADDRESS': elemento.order['billing_address'],
              'BILLING CITY': elemento.order['billing_city'],
              'TM CODE': elemento.order['tm_code'],
              'TM DATE OPERATION': elemento.order['tm_date_cruise'],
              'STATE ORDER': elemento.order['state_order'],
              'PASSENGER ID': elemento2['_id'],
              'TITLE': elemento2['pax_title'],
              'FIRST NAME': elemento2['pax_first_name'],
              'LAST NAME': elemento2['pax_last_name'],
              'NATIONALITY': paisP.Name + ' (' + elemento2['pax_nationality'] + ')',
              'DATE OF BIRTH': elemento2['pax_date_year'] + '-' + elemento2['pax_date_month'] + '-' + elemento2['pax_date_day'],
              'PASSPORT': elemento2['pax_passport'],
              'PASSPORT EXPIRATION DATE': elemento2['pax_passport_exp_year'] + '-' + elemento2['pax_passport_exp_month'] + '-' + elemento2['pax_passport_exp_day'],
              'EMERGENCY CONTACT': elemento2['pax_emergency_contact'],
              'MARITAL STATUS': elemento2['pax_marital_status'],
              'ARRIVAL DATE': elemento2['pax_arrival_date'],
              'ARRIVAL FLIGHT': elemento2['pax_arrival_flight'],
              'DEPARTURE DATE': elemento2['pax_departure_date'],
              'DEPARTURE FLIGHT': elemento2['pax_departure_flight'],
              'INSURANCE COMPANY': elemento2['pax_insurance_company'],
              'INSURANCE NUMBER': elemento2['pax_insurance_number'],
              'HOTEL CONTACT': elemento2['pax_contact_hotel'],
              'RESTRICTIONS/ ALLERGIES': elemento2['pax_restrictions']
            }], {header: encabezado, origin: -1, skipHeader: true});
        }
      }
    }
    const libro: XLSX.WorkBook = { Sheets: { 'data': hojaCalculo }, SheetNames: ['data']};
    XLSX.writeFile(libro, 'export.xlsx', { bookType: 'xlsx', bookSST: true, type: 'buffer' });
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('email');
    localStorage.removeItem('estado');
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('agente');
    localStorage.removeItem('inicio');
    localStorage.removeItem('fin');
    localStorage.removeItem('contacto');
    localStorage.removeItem('tm');
    this.router.navigate(['/login']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/edit', id]);
  }

  goToDocument(id: string) {
    this.router.navigate(['/document', id]);
  }
}
