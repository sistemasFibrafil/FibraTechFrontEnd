import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { InventoryTransferRequestFilterModel } from 'src/app/modulos/modulo-inventario/models/inventory-transfer-request.model';
import { IInventoryTransferRequest, IInventoryTransferRequest1 } from 'src/app/modulos/modulo-inventario/interfaces/inventory-transfer-request.interface';

import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { CargaSaldoInicialService } from 'src/app/modulos/modulo-inventario/services/carga-saldo-inicial.service';
import { InventoryTransferRequestService } from 'src/app/modulos/modulo-inventario/services/inventory-transfer-request.service';

interface DocStatus {
  statusCode  : string,
  statusName  : string
}

@Component({
  selector: 'app-inv-panel-carga-saldo-inicial-list',
  templateUrl: './panel-carga-saldo-inicial-list.component.html',
  styleUrls: ['./panel-carga-saldo-inicial-list.component.css']
})
export class PanelCargaSaldoInicialListComponent implements OnInit {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'Carga de saldos iniciales';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  today     = new Date();
  isDataBlob: Blob;
  isDisplay: Boolean = false;
  isClosing: boolean = false;
  isDisplayVisor: boolean = false;
  isDisplayGenerandoVisor: boolean = false;

  columnas: any[];
  opciones: any[];

  modelo          : IInventoryTransferRequest;
  modeloDelete    : IInventoryTransferRequest;
  selectedModelo  : IInventoryTransferRequest;
  listmodelo      : IInventoryTransferRequest[] = [];

  docStatus: DocStatus[];
  docStatusList: SelectItem[];
  docStatusSelected: any[];

  modeloDetalle: IInventoryTransferRequest1[] = [];
  params: InventoryTransferRequestFilterModel = new InventoryTransferRequestFilterModel();


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private inventoryTransferRequestService: InventoryTransferRequestService,
    private cargaSaldoInicialService: CargaSaldoInicialService,
  ) {}


  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
    if(!this.buttonAcces.btnBuscar){this.getList();}
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
      'startDate'   : new FormControl(new Date(this.today.getFullYear(), this.today.getMonth(), 1), Validators.compose([Validators.required])),
      'endDate'     : new FormControl(new Date(), Validators.compose([Validators.required])),
      'msDocStatus' : new FormControl('', Validators.compose([Validators.required])),
      'searchText'  : new FormControl('')
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-carga-saldo-inicial-list');
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'docNum',          header: 'Número' },
      { field: 'u_FIB_IsPkg',     header: '¿Picking?' },
      { field: 'docDate',         header: 'Fecha de contabilización' },
      { field: 'docDueDate',      header: 'Fecha de entrega' },
      { field: 'filler',          header: 'Origen' },
      { field: 'toWhsCode',       header: 'Destino' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { label: 'Editar',      icon: 'pi pi-pencil',                   command: () => { this.onClickEditar() } },
      { label: 'Cerrar',      icon: 'pi pi-times',                    command: () => { this.onClickCerrar() } },
      { label: 'Formato',     icon: 'pi pi-print',                    command: () => { this.onClickImprimir() } },
      { label: 'Transferir',  icon: 'pi pi-arrow-right-arrow-left',   command: () => { this.onClickTransferir() } },
      { label: 'Visualizar',  icon: 'pi pi-eye',                      command: () => { this.onClickVisualizar() } },
    ];
  }

  onSelectedItem(modelo: IInventoryTransferRequest) {
    this.selectedModelo = modelo;
    if(this.buttonAcces.btnEditar || modelo.docStatus === 'O' || modelo.docStatus === 'C'){
      this.opciones.find(x => x.label == "Editar").visible = true;
    } else {
      this.opciones.find(x => x.label == "Editar").visible = false;
    }
    if(this.buttonAcces.btnCerrar || modelo.docStatus === 'O'){
      this.opciones.find(x => x.label == "Cerrar").visible = true;
    } else {
      this.opciones.find(x => x.label == "Cerrar").visible = false;
    }
    if(!this.buttonAcces.btnImprimir){
      this.opciones.find(x => x.label == "Formato").visible = true;
    } else {
      this.opciones.find(x => x.label == "Formato").visible = false;
    }
    if(!this.buttonAcces.btnTransferir && modelo.docStatus === 'O' && modelo.u_FIB_IsPkg === 'N'){
      this.opciones.find(x => x.label == "Transferir").visible = true;
    } else {
      this.opciones.find(x => x.label == "Transferir").visible = false;
    }
    if(this.buttonAcces.btnVer || modelo.docStatus === 'O' || modelo.docStatus === 'C'){
      this.opciones.find(x => x.label == "Visualizar").visible = true;
    } else {
      this.opciones.find(x => x.label == "Visualizar").visible = false;
    }
  }

  getList() {
    this.isDisplay = true;
    const params: any = this.modeloForm.getRawValue();
    this.cargaSaldoInicialService.getListByFilter(params)
    .subscribe({next:(data: any[]) =>
    {
      this.isDisplay = false;
      this.listmodelo = data;
    },error:(e)=>{
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    }
    });
  }

  onClickBuscar() {
    this.getList();
  }

  onClickCreate() {
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-create']);
  }

  onClickEditar(){
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-edit', this.selectedModelo.docEntry]);
  }

  close() {
    this.isClosing = true;
    const param: any = { docEntry: this.selectedModelo.docEntry };
    this.inventoryTransferRequestService.setClose(param)
    .subscribe({ next: (resp:any)=>{
        this.getList();
        this.isClosing = false;
        this.swaCustomService.swaMsgExito(null);
      },
      error:(e)=>{
        this.isClosing = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickCerrar()
  {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleCerrar,
      this.globalConstants.subTitleCerrar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.close();
      }
    });
  }

  onClickImprimir() {
    this.isDisplayGenerandoVisor = true;
    this.inventoryTransferRequestService.getFormatoPdfByDocEntry(this.selectedModelo.docEntry)
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

  onClickTransferir(){
    this.isDisplay = true;
    this.inventoryTransferRequestService.getToTransferenciaByDocEntry(this.selectedModelo.docEntry)
    .subscribe({next:(data: IInventoryTransferRequest) =>{
      this.isDisplay = false;
      this.modelo = data;
      this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-create', JSON.stringify(this.modelo)]);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickVisualizar(){
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-view', this.selectedModelo.docEntry]);
  }
}
