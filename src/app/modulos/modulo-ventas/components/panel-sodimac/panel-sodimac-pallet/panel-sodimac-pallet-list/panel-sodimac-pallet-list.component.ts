import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IOrdenVentaSodimacConsulta } from 'src/app/modulos/modulo-ventas/interfaces/web/orden-venta-sodimac.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { OrdenVentaSodimacService } from 'src/app/modulos/modulo-ventas/services/web/orden-venta-sodimac.service';



@Component({
  selector: 'app-ven-panel-sodimac-pallet-list',
  templateUrl: './panel-sodimac-pallet-list.component.html',
  styleUrls: ['./panel-sodimac-pallet-list.component.css']
})
export class PanelSodimacPalletListComponent implements OnInit {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'Pallet';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  columnas: any[];
  opciones: any = [];

  modeloDelete: IOrdenVentaSodimacConsulta;
  modeloSelected: IOrdenVentaSodimacConsulta;
  list: IOrdenVentaSodimacConsulta[] = [];

  params: FilterRequestModel = new FilterRequestModel();

  isDisplay: Boolean = false;
  isDeleting: boolean = false;
  isDisplayVisor: boolean = false;
  isDisplayGenerandoVisor: boolean = false;

  isDataBlob: Blob;


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private ordenVentaSodimacService: OrdenVentaSodimacService
  ) {}


  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
      'dat1'      : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'dat2'      : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'text1'     : new FormControl('')
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-sodimac-pallet-list');
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'docNum',          header: 'Número' },
      { field: 'numOrdenCompra',  header: 'OC' },
      { field: 'docDate',         header: 'Fecha de contabilización' },
      { field: 'docDueDate',      header: 'Fecha de entrega' },
      { field: 'taxDate',         header: 'Fecha de documento' },
      { field: 'cardCode',        header: 'Código de cliente' },
      { field: 'cardName',        header: 'Nombre de cliente' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      //{ label: 'Editar',      icon: 'pi pi-pencil',         command: () => { this.editar() } },
      { label: 'Vizualizar',  icon: 'pi pi-eye',            command: () => { this.ver() } },
      { label: 'Imprimir',    icon: 'pi pi-print',          command: () => { this.imprimir() } },
      { label: 'Eliminar',    icon: 'pi pi-trash',          command: () => { this.eliminar() } },
    ];
  }


  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
  }

  onListar() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ordenVentaSodimacService.getListOrdenVentaSodimacLpnByFiltro(this.params)
    .subscribe({next:(data: IOrdenVentaSodimacConsulta[]) =>
    {
      this.isDisplay = false;
      this.list = data;
    },error:(e)=>{
      this.isDisplay = false;
      this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    }
    });
  }

  onToBuscar() {
    this.onListar();
  }

  onToCreate() {
    this.router.navigate(['/main/modulo-ven/panel-sodimac-pallet-asignacion']);
  }

  onToItemSelected(modelo: IOrdenVentaSodimacConsulta) {
    this.modeloSelected = modelo;
    // if(this.buttonAcces.btnGuiar || modelo.codEstado === '02' || modelo.codEstado === '03'){
    //   this.opciones.find(x => x.label == "Guiar").visible = false;
    // } else {
    //   this.opciones.find(x => x.label == "Guiar").visible = true;
    // }

    // if(this.buttonAcces.btnEditar || modelo.codEstado === '02' || modelo.codEstado === '03'){
    //   this.opciones.find(x => x.label == "Editar").visible = false;
    // } else {
    //   this.opciones.find(x => x.label == "Editar").visible = true;
    // }

    // if(this.buttonAcces.btnEliminar || modelo.codEstado === '02' || modelo.codEstado === '03'){
    //   this.opciones.find(x => x.label == "Eliminar").visible = false;
    // } else {
    //   this.opciones.find(x => x.label == "Eliminar").visible = true;
    // }
  }

  // onToRowSelectView(modelo: IPickingVentaByFiltro){
  //   this.router.navigate(['/main/modulo-ve/picking-venta-view', modelo.idPicking]);
  // }

  ver(){
    this.router.navigate(['/main/modulo-ven/panel-sodimac-detallado-pallet-view', this.modeloSelected.id]);
  }

  // onToRowSelectEdit(modelo: IPickingVentaByFiltro){
  //   this.router.navigate(['/main/modulo-ve/picking-venta-edit', modelo.idPicking]);
  // }

  guiar(){
    //this.router.navigate(['/main/modulo-ve/panel-sodimac-pedido-create', this.modeloSelected.idSolicitudTraslado]);
  }

  editar(){
    //this.router.navigate(['/main/modulo-ve/panel-sodimac-pedido-update', this.modeloSelected.idSolicitudTraslado]);
  }

  imprimir() {
    this.isDisplayGenerandoVisor = true;
    this.ordenVentaSodimacService.getBarcodeLpnPdfById(this.modeloSelected.id)
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

  onToDelete() {
    // this.isDeleting = true;
    // const param: any = { idPicking: this.modeloSelected.idPicking, idUsuario: this.userContextService.getIdUsuario() };
    // this.solicitudTrasladoService.setDelete(param)
    // .subscribe({ next: (resp:any)=>{
    //     this.onListar();
    //     this.isDeleting = false;
    //     this.swaCustomService.swaMsgExito(null);
    //   },
    //   error:(e)=>{
    //     this.isDeleting = false;
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  // onToRowSelectDelte(modelo: IPickingVentaByFiltro)
  // {
  //   this.modeloDelete = modelo;
  //   this.onConfirmDelete();
  // }

  eliminar()
  {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleEliminar,
      this.globalConstants.subTitleEliminar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.onToDelete();
      }
    });
  }
}
