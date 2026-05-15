import {
  Directive,
  EventEmitter,
  ElementRef,
  HostListener,
  Input,
  Output,
} from "@angular/core";
import { FileUploader, FileItem } from "ng2-file-upload";
import { URL_SERVICIOS } from "../../config/config";

@Directive({
  standalone: false,
  selector: "[appNgDropFiles]",
})
export class NgDropFilesDirective {
  private URL = URL_SERVICIOS + "/upload/";
  @Input() tiempo = false;
  @Input() imagenTemp: object[] = [];
  @Input() idOrder: string;
  @Input() archivosSubidos: object[] = [];
  @Input() archivosTemporales: FileUploader = new FileUploader({
    url: this.URL,
    itemAlias: "temporales",
  });
  @Output() mouseSobre: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() process: EventEmitter<{ isLoading: boolean; numberFiles: any[] }> =
    new EventEmitter<{ isLoading: boolean; numberFiles: any[] }>();

  // extensiones validas
  public extArchivos: any[] = [
    {
      tipo: "image",
      posicion: "0",
    } /*,
    {
      tipo: 'msword', // .doc
      posicion: '12'},
    {
      tipo: 'word',  // docx
      posicion: '46'},
    {
      tipo: 'pdf',
      posicion: '12'}*/,
  ];

  constructor() {}

  @HostListener("dragover", ["$event"])
  public onDrangEnter(event: any) {
    this.mouseSobre.emit(true);
    this._prevenirDetener(event);
  }
  @HostListener("dragleave", ["$event"])
  public onDrangLeave(event: any) {
    this.mouseSobre.emit(false);
  }

  @HostListener("drop", ["$event"])
  public onDrop(event: any) {
    const transferencia = this._getTransferenica(event);
    if (!transferencia) {
      return;
    }
    this._extraeArchivo(transferencia.files);
    this._prevenirDetener(event);
    this.mouseSobre.emit(false);
    this.archivosTemporales.uploadAll();
  }

  private _getTransferenica(event: any) {
    return event.dataTransfer
      ? event.dataTransfer
      : event.originalEvent.dataTransfer;
  }

  private async _extraeArchivo(archivosLista: FileList) {
    if (!this.tiempo) {
      this.process.emit({
        isLoading: true,
        numberFiles: Object.getOwnPropertyNames(archivosLista),
      });
      let auxArray: any[] = Object.getOwnPropertyNames(archivosLista);
      let index: number = auxArray.length;
      for (const propiedad in Object.getOwnPropertyNames(archivosLista)) {
        const archivoTemporal = archivosLista[propiedad];

        if (this._cargaArchivos(archivoTemporal)) {
          const nuevoArchivo = new FileItem(
            this.archivosTemporales,
            archivoTemporal,
            {} as any
          );
          const dividirNombre = nuevoArchivo.file.name.split(".");
          const extArchivo = dividirNombre[dividirNombre.length - 1];
          nuevoArchivo.file.name =
            this.idOrder + "_" + Date.now() + "." + extArchivo;

          // convert if it image is ios origin
          const blob = nuevoArchivo._file;
          var a = document.createElement("a");
          try {
            const { default: heic2any } = await import('heic2any');
            const auxblob = await heic2any({
              blob,
              toType: "image/gif",
            });
            const filename = blob.name + ".gif";
            nuevoArchivo._file = this.blobToFile(auxblob, filename);
          } catch (error) {}

          this.archivosTemporales.queue.push(nuevoArchivo);
          this.almacenaImagen(nuevoArchivo);
          this.archivosSubidos.push({
            file_id_order: this.idOrder,
            file_name: nuevoArchivo.file.name,
            file_name_user: nuevoArchivo._file.name,
            file_size:
              (nuevoArchivo.file.size / 1024 / 1024).toFixed(2) + " MB",
            file_status: "1",
            estado: true,
          });
          index = index - 1;
          auxArray = auxArray.splice(0, index);
          this.process.emit({
            isLoading: true,
            numberFiles: auxArray,
          });
        }
      }
      this.process.emit({
        isLoading: false,
        numberFiles: auxArray,
      });
    }
  }
  blobToFile(theBlob: any, fileName: string): File {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }

  private almacenaImagen(archivo: FileItem) {
    if (archivo.file.type.indexOf("image") >= 0) {
      let reader = new FileReader();
      let urlTemp = reader.readAsDataURL(archivo._file);
      reader.onloadend = () => {
        this.imagenTemp.push({ id: archivo.file.name, data: reader.result });
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
  private _prevenirDetener(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  private _validaExt(tipoArchivo: string): boolean {
    if (tipoArchivo == "" || tipoArchivo == undefined) {
      alert("Error!  Extension File no validate.");
      return true;
    } else {
      for (const tipoA of this.extArchivos) {
        if (tipoArchivo.startsWith(tipoA.tipo, tipoA.posicion) === true) {
          console.log(tipoArchivo);
          return false;
        }
      }
      alert("Error!  Extension File no validate.");
      return true;
    }
  }
}
