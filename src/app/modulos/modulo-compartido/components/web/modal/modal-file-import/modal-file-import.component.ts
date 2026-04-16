import swal from 'sweetalert2';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ArticuloSapForSodimacBySkuModel } from 'src/app/modulos/modulo-inventario/models/items.model';
import { ItemsService } from 'src/app/modulos/modulo-inventario/services/items.service';


@Component({
  selector: 'app-modal-file-import',
  templateUrl: './modal-file-import.component.html'
})
export class ModalFileImportComponent implements OnInit {
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isSaving: Boolean = false;
  isDisplay: Boolean = false;
  isEnvioArchivo: Boolean;

  progress: number = 0;

  lista: any[];
  uploadFile: any[] = [];
  param: ArticuloSapForSodimacBySkuModel = new ArticuloSapForSodimacBySkuModel();

  fileContent: string[] = [];
  fileName: string | undefined;
  selectedFile: any;

  @Output() eventoAceptar = new EventEmitter<any>();
  @Output() eventoCancelar = new EventEmitter<boolean>();

  constructor
  (
    private itemsService: ItemsService,
  ) { }

  ngOnInit() {
  }

  onToUpload(event, fileUpload)
  {
    this.lista = [];
    let swalWithBootstrapButtons = swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal-import') });

    if (event.files === undefined) {
      swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, 'Seleccione el archivo.', 'info');
      return;
    }

    if (event.files.length === 0) {
      swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, 'Seleccione el archivo.', 'info');
      return;
    }

    const file: File = event.files[0];

    if (file)
    {
      const reader = new FileReader();
      reader.onload = (e: any) =>
      {
        const fileContent = e.target.result;
        const rows = fileContent.split('\n');
        const data: any[] = [];
        for (let i = 0; i < rows.length; i++) {
          const columns = rows[i].split('|');
          data.push(columns);
        }

        this.param.linea = [];
        for (let i = 1; i < data.length - 1; i++)
        {
          this.param.linea.push
          ({
            line                : Number(data[i][18]),
            numLocal            : Number(data[i][19]),
            nomLocal            : data[i][20].toString().trim(),
            codEstado           : '01',
            sku                 : data[i][16].toString().trim(),
            dscriptionLarga     : data[i][17].toString().trim(),
            ean                 : data[i][15].toString().trim(),
            quantity            : Number(data[i][21])
          });
        }
        this.getArticuloForOrdenVentaSodimacBySku(this.param);
      };

      reader.readAsText(file);
    }
  }

  getArticuloForOrdenVentaSodimacBySku(value: ArticuloSapForSodimacBySkuModel) {
    this.isDisplay = true;
    this.itemsService.getArticuloForOrdenVentaSodimacBySku(value)
    .subscribe({next:(data: any[]) =>{
      if(data)
      {
        this.isDisplay = false;
        this.eventoAceptar.emit(data);
      }
      },error:(e)=>{
        this.isDisplay = false;
        let swalWithBootstrapButtons = swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal-import') });
        swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
      }
    });
  }

  onToImport() {
  }

  onToCancelUpload(fileUpload) {
    fileUpload.clear();
    this.eventoCancelar.emit(false);
  }
}
