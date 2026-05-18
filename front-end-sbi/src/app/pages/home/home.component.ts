import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FindService } from 'src/app/services/find.service';
import { Seller } from 'src/app/models/seller.model';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../../assets/css/stylesReports.css']
})

export class HomeComponent implements OnInit {

  public meses: object[] = [
    { 'id': '01', 'value': 'Jan' },
    { 'id': '02', 'value': 'Feb' },
    { 'id': '03', 'value': 'Mar' },
    { 'id': '04', 'value': 'Apr' },
    { 'id': '05', 'value': 'May' },
    { 'id': '06', 'value': 'Jun' },
    { 'id': '07', 'value': 'Jul' },
    { 'id': '08', 'value': 'Aug' },
    { 'id': '09', 'value': 'Sep' },
    { 'id': '10', 'value': 'Oct' },
    { 'id': '11', 'value': 'Nov' },
    { 'id': '12', 'value': 'Dec' }
  ];

  public estructurafecha: object = {
    'caption': 'Completed Orders',
  };
  public estructurames: object = {
    'caption': 'Registered Orders',
    'xaxisname': 'Month',
    'yaxisname': 'Register'
  };

  public ubicacion = 'activo';
  public rolAgente = '';
  public sellerCompany: Seller[] = [];
  public idsAgente: string;
  public nameCiaReportSellers = environment.nameCiaReportSellers;
  public status = false;


  constructor(
    public usuarioService: UserService,
    private buscaService: FindService,
    private cdr: ChangeDetectorRef
    ) {
    setTimeout(() => {
      this.agruparSellers();
    }, 1000);
    this.status = false;
    this.usuarioService.getSeller(atob(localStorage.getItem('email'))).subscribe(
      (sellerInfo: any) => {
        this.rolAgente = sellerInfo['usuarios']['0'].role;
        this.idsAgente = sellerInfo['usuarios']['0'].id;
        this.status = true;
        this.cdr.detectChanges();
        if (this.rolAgente === 'OPERACION_ROLE') {
          this.listarVendedores();
        }
      },
      (_err) => { this.status = true; this.cdr.detectChanges(); });
  }

  ngOnInit() { }

  listarVendedores() {
    this.usuarioService.getSellersCompany(this.nameCiaReportSellers).subscribe(
      (sellers: any) => {
        this.sellerCompany = sellers['usuarios'];
        // console.log(this.sellerCompany);
      });
  }

  agruparSellers() {
    for (let i = 0; i < this.sellerCompany.length; i++) {
      this.idsAgente += this.sellerCompany[i]['id'].toString();
      if (i < this.sellerCompany.length - 1) {
        this.idsAgente += '-';
      }
    }
    // console.log( this.idsAgente );

    this.status = true;
  }
}
