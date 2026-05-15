import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Seller } from 'src/app/models/seller.model';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}


export const ROUTES: RouteInfo[] = [
  { path: '/home', title: 'General Info',  icon: 'assessment', class: '' },
  { path: '/reports', title: 'Sellers Info',  icon: 'content_paste', class: '' },
  { path: '/dashboard', title: 'Dashboard',  icon: 'format_line_spacing', class: '' },
  // { path: '/user-profile', title: 'Account',  icon: 'person', class: '' },
  { path: '/login', title: 'Logout',  icon: 'library_books', class: '' },
];

@Component({
  standalone: false,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']

})
export class SidebarComponent implements OnInit {

  menuItems: any[];
  public activo = 'home';
  public rolAgente = '';
  public idAgente = '';
  public idsAgente: Seller ;
  public sellerCompany: Seller [] = [];

  public logoCompany = environment.logoName;
  public nameCompany = environment.nameCompany;
  public serverUrl = environment.serverUrl;
  public nameCiaReportSellers = environment.nameCiaReportSellers;


  constructor(
    private router: Router,
    public usuarioService: UserService
    ) {
      this.usuarioService.getSeller(atob(localStorage.getItem('email'))).subscribe(
        (sellerInfo: any) => {
          this.rolAgente = sellerInfo['usuarios']['0'].role;
          this.idAgente = sellerInfo['usuarios']['0'].id;
          if (this.rolAgente === 'OPERACION_ROLE') {
            this.listarVendedores();
          } else {
            this.sellerCompany = sellerInfo['usuarios'];
          }
        });
    }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    if (localStorage.getItem('email') === null || '') {
      this.cerrarSesion();

    }
  }

  isMobileMenu() {
    if ($(window).width() > 991) {
        return false;
    }
    return true;
  }


  activar (index) {
    if (index === 'Logout') {
      this.cerrarSesion();
    }
  }

  listarVendedores() {
    this.usuarioService.getSellersCompany(this.nameCiaReportSellers).subscribe(
      (sellers: any) => {
        this.sellerCompany = sellers['usuarios'];
        // console.log(this.sellerCompany);
      });

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
    this.router.navigate(['./login']);
  }

}


