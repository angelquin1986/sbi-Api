import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FindService } from '../../services/find.service';

@Component({
  standalone: false,
  selector: 'app-graphic-constructor',
  templateUrl: './graphic-constructor.component.html',
  styleUrls: ['./graphic-constructor.component.css']
})
export class GraphicConstructorComponent implements OnInit, OnChanges {

  public datos: object[] = [];
  public datosTM: object[] = [];
  @Input() estructura: Object;
  @Input() idsAgente: string;
  public width = '100%';
  public height = '80%';
  @Input() type = 'Column3d';
  public dataFormat = 'json';
  public estructuraGrafica: Object = { chart: {}, data: [] };

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


  constructor(
    private buscaService: FindService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['idsAgente'] && changes['idsAgente'].currentValue) {
      this.datos = [];
      this.datosTM = [];
      this.ObtieneDatosxMes();
      this.ObtieneDatosxFechaOperacion();
    }
  }

  ObtieneDatosxMes() {
    if (!this.idsAgente) { return; }
    this.buscaService.obtenerOrdersporMes(this.idsAgente).subscribe(
      (orders: any) => {
        // console.log('++++++*', orders);
        if (orders['orders'].length > 0) {
          const mesAct = orders['orders'][0]._id.substring(0, 2);
          for (const elemento of orders['orders']) {
            const mesD = this.meses.find(mesB => mesB['id'] === elemento['_id'].substring(0, 2));
            this.datos.push({
              label: mesD['value'] + '-' + elemento._id.substring(3),
              value: elemento.cant
            });
          }
          this.cargaDatos();
        }
      });
  }

  ObtieneDatosxFechaOperacion() {
    if (!this.idsAgente) { return; }
    this.buscaService.obtenerCantTM(this.idsAgente).subscribe(
      (cantidadTM: any) => {
        if (cantidadTM['cuenta'].length > 0) {
          for (const elemento of cantidadTM['cuenta']) {
            this.datosTM.push({
              label: elemento._id,
              value: elemento.cant
            });
          }
        }
      });
  }

  cargaDatos() {
    this.estructuraGrafica = {
      chart: {
        'caption': this.estructura['caption'],
        'xaxisname': this.estructura['xaxisname'],
        'yaxisname': this.estructura['yaxisname'],
        'palettecolors': 'f2726f,29c3be,5d62b5',
        'theme': 'fusion',
      },
      data: this.estructura['caption'] === 'Completed Orders' ? this.datosTM : this.datos
    };
  }
}
