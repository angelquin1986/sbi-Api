import { Component, ViewChild, OnInit, Input } from '@angular/core';
import { FindService } from '../../services/find.service';
import { Seller } from '../../models/seller.model';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';


@Component({
  standalone: false,
  selector: 'app-graphic-report',
  templateUrl: './graphic-report.component.html',
  styleUrls: ['../../../assets/css/stylesReports.css']
})
export class GraphicReportComponent implements OnInit {

  @Input() ubicacion: string;
  @Input() rolAgente: string;
  @Input() sellerCompany: Seller[] = [];

  /* @ViewChild('1') GraphicColumn: GraphicColumnComponent;
   @ViewChild('2') GraphicPie: GraphicPieComponent;*/

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

  // public ubicacion = 'activo';
  // public rolAgente = '';
  // public sellerCompany: Seller[] = [];
  public idsAgente = '';
  public nameCiaReportSellers = environment.nameCiaReportSellers;
  public status: Boolean;


  constructor(
    public usuarioService: UserService,
    private buscaService: FindService
  ) {
    this.status = false;
    this.agruparSellers();
    this.usuarioService.getSeller(atob(localStorage.getItem('email'))).subscribe(
      (sellerInfo: any) => {
        this.rolAgente = sellerInfo['usuarios']['0'].role;
        this.idsAgente = sellerInfo['usuarios']['0'].id;
        if (this.rolAgente === 'OPERACION_ROLE') {
          this.listarVendedores();
        } else {
          this.sellerCompany = sellerInfo['usuarios'];
        }
        this.status = true;
      });
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
    // console.log('status', this.status);
    for (let i = 0; i < this.sellerCompany.length; i++) {
      this.idsAgente += this.sellerCompany[i]['id'].toString();
      if (i < this.sellerCompany.length - 1) {
        this.idsAgente += '-';
      }
      // console.log(this.idsAgente);
    }
  }
}

