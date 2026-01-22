import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IEntregaLocalElectronica } from '../../../interfaces/entrega.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { PackingListService } from '../../../services/packingList.service';
import { FacturacionElectronicaSapService } from '../../../services/facturacion-electronica.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/campo-defnido-usuario.service';

interface ITipDocumento {
  code  : string,
  name  : string
}



@Component({
  selector: 'app-fac-panel-guia-list',
  templateUrl: './panel-guia-list.component.html',
  styleUrls: ['./panel-guia-list.component.css']
})
export class PanelGuiaListComponent implements OnInit {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'Guías';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;
  isDisplayVisor: boolean = false;
  isDisplayGenerandoVisor: boolean = false;

  isDataBlob: Blob;

  listObjType: SelectItem[];
  listStatusSunat: SelectItem[];
  listGuia: IEntregaLocalElectronica[];
  params: FilterRequestModel = new FilterRequestModel();

  columnas: any[];

  constructor(
    private fb: FormBuilder,
    private packingListService: PackingListService,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    private facturacionElectronicaSapService: FacturacionElectronicaSapService,
  ) { }

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.getListTipoDocumento();
    this.getListStatusSunat();
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
      {
        'dat1'        : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'dat2'        : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'objType'     : new FormControl('', Validators.compose([Validators.required])),
        'statusSunat' : new FormControl('', Validators.compose([Validators.required])),
        'text1'       : new FormControl(''),
        'text2'       : new FormControl(''),
      }
    );

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-fac-panel-guia-list');
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'docNum',                  header: 'Número SAP' },
      { field: 'numeroDocumento',         header: 'Número' },
      { field: 'fechaEmision',            header: 'Fecha de emisión' },
      { field: 'fechaEntrega',            header: 'Fecha de entrega' },
      { field: 'clienteNumeroDocumento',  header: 'RUC' },
      { field: 'clienteNombre',           header: 'Nombre de cliente' },
      { field: 'clienteNombreInter',      header: 'Nombre internacional' },
      { field: 'nomStatusSunat',          header: 'Estado' },
    ];
  }

  getListTipoDocumento()
  {
    this.listObjType =
    [
      { label: 'Guía de venta',   value: '15' },
      { label: 'Guía interna',    value: '67' },
    ];

    const item: any = this.listObjType.find(x=>x.value === '15');
    this.modeloForm.controls['objType'].setValue({ label: item.label, value: item.value });
  }


  getListStatusSunat() {
    this.listStatusSunat = [];
    const param: any = { tableID: 'ODLN', aliasID: 'FIB_ESTADOSUNAT' };
    this.camposDefinidoUsuarioService.getList(param)
    .subscribe({next:(data: any[]) =>{
        this.listStatusSunat = [];
        for (let item of data) {
          this.listStatusSunat.push({ label: item.descr, value: item.fldValue });
        }

        const item: any = this.listStatusSunat.find(x=>x.value === '0');
        this.modeloForm.controls['statusSunat'].setValue({ label: item.label, value: item.value });
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onSetParametro()
  {
    let objType     : string = '';
    let statusCode  : string = '';

    if (this.modeloForm.controls['objType'].value) {
      let itemTipobjType = this.modeloForm.controls['objType'].value;
      objType = itemTipobjType.value;
    }

    if (this.modeloForm.controls['statusSunat'].value) {
      let itemStatusCode = this.modeloForm.controls['statusSunat'].value;
      statusCode = itemStatusCode.value;
    }

    this.params = this.modeloForm.getRawValue();
    this.params.cod1 = objType;
    this.params.cod2 = statusCode;
  }

  onListar() {
    this.isDisplay = true;
    this.listGuia = [];
    this.onSetParametro();
    this.facturacionElectronicaSapService.getListGuiaElectronicaByFiltro(this.params)
    .subscribe({ next:(data: IEntregaLocalElectronica[]) => {
        this.isDisplay = false;
        this.listGuia = data;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToBuscar() {
    this.onListar();
  }

  onToRowSelectEnviar(modelo: IEntregaLocalElectronica) {
    this.isDisplay = true;
    const value: any = { cod1: modelo.objType, id1: modelo.docEntry };
    this.facturacionElectronicaSapService.setEnviar(value)
    .subscribe({ next:(data: any) => {
      this.isDisplay = false;
      this.swaCustomService.swaMsgExito(null);
      this.onListar();
    },error:(e)=>{
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    }
  });
  }

  onToRowSelectPrint(modelo: IEntregaLocalElectronica) {
    this.isDisplayGenerandoVisor = true;
    this.packingListService.getPackingListPdfByDocEntry(modelo.docEntry)
    .subscribe({next:(resp: any) => {
      switch (resp.type) {
        case HttpEventType.DownloadProgress:
          break;
        case HttpEventType.Response:
          this.isDataBlob = new Blob([resp.body], {type: resp.body.type});
          this.isDisplayGenerandoVisor = false;
          this.isDisplayVisor = true;
          break;
      }
      },error:(e)=>{
        this.isDisplayGenerandoVisor = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
  });
  }
}
