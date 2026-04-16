import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ArticuloSapForSodimacBySkuModel } from 'src/app/modulos/modulo-inventario/models/items.model';


@Component({
  selector: 'app-modal-subir-archivo',
  templateUrl: './modal-subir-archivo.component.html'
})
export class ModalSubirArchivoComponent implements OnInit {
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

  @Input() fileType: string;

  @Output() eventoAceptar = new EventEmitter<any>();
  @Output() eventoCancelar = new EventEmitter<boolean>();

  constructor
  (
  ) { }

  ngOnInit() {
  }

  onClickUpload(event)
  {
    const file: File = event.files[0];

    if (file)
    {
      this.eventoAceptar.emit(file);
    }
  }

  onToImport() {
  }

  onClickCancelUpload(fileUpload) {
    fileUpload.clear();
    this.eventoCancelar.emit(false);
  }
}
