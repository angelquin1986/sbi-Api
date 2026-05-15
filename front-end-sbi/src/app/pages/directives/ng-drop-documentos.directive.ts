import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';
import { FileUploader, FileItem} from "ng2-file-upload";
import { URL_SERVICIOS} from '../../config/config';

@Directive({
  standalone: false,
  selector: '[appNgDropDocumentos]'
})
export class NgDropDocumentossDirective {
  private URL = URL_SERVICIOS + '/upload/';
  @Input() tiempo = false;
  @Input() imagenTemp: object [] = [];
  @Input() idOrder: string;
  @Input() archivosSubidos: object [] = [];
  @Input() archivosTemporales: FileUploader = new FileUploader({url: this.URL, itemAlias: 'temporales'});
  @Output() mouseSobre: EventEmitter<boolean> = new EventEmitter<boolean>();
  // extensiones validas
  public extArchivos: any[] = [
    {
      tipo: 'image',
      posicion: '0'},
    {
      tipo: 'msword', // .doc
      posicion: '12'},
    {
      tipo: 'word',  // docx
      posicion: '46'},
    {
      tipo: 'pdf',
      posicion: '12'}
  ];



  constructor() {
  }

  @HostListener('dragover', ['$event'])
  public onDrangEnter( event: any) {
    this.mouseSobre.emit(true);
    this._prevenirDetener(event);
  }
  @HostListener('dragleave', ['$event'])
  public onDrangLeave( event: any) {
    this.mouseSobre.emit(false);
  }

  @HostListener('drop', ['$event'])
  public onDrop( event: any) {
    const transferencia = this._getTransferenica(event);
    if (!transferencia) {
      return;
    }
    this._extraeArchivo(transferencia.files);
    this._prevenirDetener(event);
    this.mouseSobre.emit(false);
    this.archivosTemporales.uploadAll();
  }

  private _getTransferenica (event: any ) {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
  }

  private _extraeArchivo(archivosLista: FileList ) {
    // console.log(this.archivosTemporales);
    if (!this.tiempo) {
      for (const propiedad in Object.getOwnPropertyNames( archivosLista)) {
        const archivoTemporal = archivosLista[propiedad];

        if (this._cargaArchivos(archivoTemporal)) {
          const nuevoArchivo = new FileItem(this.archivosTemporales, archivoTemporal, {} as any);
          const dividirNombre = nuevoArchivo.file.name.split('.');
          const extArchivo = dividirNombre[dividirNombre.length - 1 ];
          nuevoArchivo.file.name = this.idOrder + '_' + Date.now() + '.' + extArchivo;
          this.archivosTemporales.queue.push(nuevoArchivo);
          this.almacenaImagen(nuevoArchivo);
          this.archivosSubidos.push({document_id_order: this.idOrder, document_name: nuevoArchivo.file.name, document_name_user: nuevoArchivo._file.name,
            document_size: (( nuevoArchivo.file.size / 1024 / 1024).toFixed(2) + ' MB' ), document_status: '1', 'estado': true });
        }
      }
    }
  }

  private almacenaImagen(archivo: FileItem) {
    if (archivo.file.type.indexOf('image') >= 0 ) {
      let reader = new FileReader();
      let urlTemp = reader.readAsDataURL(archivo._file);
      reader.onloadend = () => {
        this.imagenTemp.push({'id': archivo.file.name, 'data': reader.result});
      };
    }
  }
  // Validaciones
  private _cargaArchivos(archivo: File): boolean {
    if (!this._validaExt(archivo.type)) {
      return true;
    } else {
      return false;
    }
  }

  // prevenir Abrir img
  private _prevenirDetener(event){
    event.preventDefault();
    event.stopPropagation();
  }



  private _validaExt(tipoArchivo: string): boolean {
    if (tipoArchivo == "" || tipoArchivo == undefined ) {
      alert('Error!  Extension File no validate.');
      return true;
    } else {
      for (const tipoA of this.extArchivos) {
        if (tipoArchivo.startsWith(tipoA.tipo, tipoA.posicion) === true) {
          return false;
        }
      }
      alert('Error!  Extension File no validate.');
      return true;
    }
  }



}
