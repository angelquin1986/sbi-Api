import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router} from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { Contacto } from '../../models/contact.model';

@Component({
  standalone: false,
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['../../../assets/css/stylesContactos.css']
})
export class ContactsComponent implements OnInit {

  usuario = localStorage.getItem('usuario');
  datos: Contacto[] = [];
  displayedColumns: string[] = ['nombre', 'cargo', 'mail', 'cel_ofi', 'ext_Royal_GPS', 'ext_Ip', 'ext'];
  dataSource: MatTableDataSource<Contacto>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor( public route: ActivatedRoute,
               public router: Router,
               public contactService: ContactService) { }

  ngOnInit() {
    this.obtenerData();
  }

  aplicarFiltro(valorFiltro: string) {
    this.dataSource.filter = valorFiltro.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  obtenerData() {
    this.contactService.getContactos().subscribe(
      (datos: any) => {
        this.datos = datos['contact'];
        this.dataSource = new MatTableDataSource(this.datos);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.ocultarColumna();
      });
  }

  ocultarColumna() {
    this.contactService.getIp().subscribe(
      (datosIP: any) => {
        const obIP = datosIP['ip'];
        if (this.usuario === null && obIP !== '186.4.249.196' && obIP !== '186.71.60.242') {
          this.displayedColumns = ['nombre', 'cargo', 'mail', 'ext', 'ext_Royal_GPS', 'ext_Ip'];
          for ( const elemento of this.datos ) {
            elemento['cel_ofi'] = '';
          }
        }
        this.dataSource = new MatTableDataSource(this.datos);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  ingresarSesion() {
    this.router.navigate(['/login']);
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

}
