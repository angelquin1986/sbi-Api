import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {environment} from '../../environments/environment';
import {Seller} from '../models/seller.model';

@Component({
  standalone: false,
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['../../assets/css/stylesDashboard.css']

})
export class SidenavComponent implements OnInit {

  public activo = 'home';
  public rolAgente = '';
  public idAgente = '';
  public idsAgente: Seller ;
  public sellerCompany: Seller [] = [];


  public nameCiaReportSellers = environment.nameCiaReportSellers;

  constructor( private router: Router, public usuarioService: UserService ) {
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
    if (localStorage.getItem('email') === null || '') {
      this.cerrarSesion();

    }
  }

  activar (index) {
    switch (index) {
      case 1:
        this.activo = 'home';
        break;
      case 2:
        this.activo = 'dashboard';
        break;
      case 3:
        this.activo = 'estadisticas';
        break;
    }
    document.getElementById('button-sidenav').click();
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
