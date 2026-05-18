import { Component, OnInit } from '@angular/core';
import { NgForm} from '@angular/forms';
import { Router} from '@angular/router';
import { LoginService} from '../../services/login.service';
import {environment} from '../../../environments/environment';
import {UserService} from '../../services/user.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../../../assets/css/stylesLogin.css']
})
export class LoginComponent implements OnInit {

  public nameCiaReportSellers = environment.nameCiaReportSellers;

  estado = false;
  hide = true;
  usuario_input = '';
  password_input = '';
  usuario = localStorage.getItem('usuario');

  constructor(
    private router: Router,
    private loginService: LoginService,
    private usuarioService: UserService
    ) {
    }

  ngOnInit() {

    if (localStorage.getItem('usuario') !== null) {
      this.router.navigate(['/dashboard']);
    } else {
      this.cerrarSesion();
    }
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

  ingresar() {
    const user = this.usuario_input.trim();
    const pass = this.password_input;
    if (!user || !pass) {
      alert('Fill in all the fields');
      return;
    }
    this.loginService.postInicia(pass, user).subscribe(
      (data: any) => {
        if (data.status) {
          localStorage.setItem('token', btoa(data.token));
          localStorage.setItem('estado', btoa(data.status));
          localStorage.setItem('email', btoa(user));
          this.usuarioService.getSeller(user).subscribe(
            (_sellerInfo: any) => { this.router.navigate(['/dashboard']); },
            (_err: any) => { this.router.navigate(['/dashboard']); }
          );
        } else {
          alert('Incorrect data');
        }
      },
      (_err: any) => { alert('Incorrect data'); }
    );
  }

  ingresar_res(forma: any) {
    this.loginService.postInicia(forma.value.password , forma.value.usuario).subscribe(
      (data: any) => {
        const usuarioForma = forma.value.usuario;
        const passwordForma = forma.value.password;

        if (usuarioForma === '' || passwordForma === '') {
          alert('Fill in all the fields');
        } else {
          if (data.status) {
            localStorage.setItem('token', btoa(data.token));
            localStorage.setItem('estado', btoa(data.status));
            localStorage.setItem('email', btoa(usuarioForma));

            this.usuarioService.getSeller(usuarioForma).subscribe(
              (sellerInfo: any) => {
                const seller = sellerInfo['usuarios'] && sellerInfo['usuarios']['0'];
                if (seller && (
                  seller.company === this.nameCiaReportSellers ||
                  seller.role === 'OPERACION_ROLE' ||
                  seller.role === 'OPERADOR_ROLE' ||
                  seller.role === 'AGENTE_ROLE'
                )) {
                  return this.router.navigate(['/dashboard']);
                } else {
                  // Autenticado en galavail pero sin registro local — igual navega
                  return this.router.navigate(['/dashboard']);
                }
              },
              (err) => {
                // Error al buscar en BD local — igual navega si galavail autenticó
                return this.router.navigate(['/dashboard']);
              });

          } else {
            alert('Incorrect data');
          }
        }
      },
      (err) => {
        alert('Incorrect data');
      });
  }

}
