import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { UtilService } from 'src/app/services/util.service';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { LayoutComponent } from 'src/app/layout/layout.component';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { OrdenVentaSodimacLpnUpdateModel } from 'src/app/modulos/modulo-ventas/models/web/orden-venta-sodimac.model';

import { HttpEventType } from '@angular/common/http';
import { IOrdenVentaSodimacDetalle } from 'src/app/modulos/modulo-ventas/interfaces/web/orden-venta-sodimac.interface';
import { OrdenVentaSodimacService } from 'src/app/modulos/modulo-ventas/services/web/orden-venta-sodimac.service';



@Component({
  selector: 'app-ven-panel-sodimac-detallado-pallet-view',
  templateUrl: './panel-sodimac-detallado-pallet-view.component.html',
  styleUrls: ['./panel-sodimac-detallado-pallet-view.component.css']
})
export class PanelSodimacDetalladoPalletViewComponent implements OnInit {

  // Titulo del componente
  titulo = 'Detallado - Pallet';

  modeloFormCab1: FormGroup;
  modeloFormCab2: FormGroup;
  buttonAcces: ButtonAcces = new ButtonAcces();
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  idOrdenVentaSodimac: number = 0;
  docEntry: number = 0;
  numOrdenCompra: string = '';
  cntctCode: number = 0;
  modeloSave: OrdenVentaSodimacLpnUpdateModel = new OrdenVentaSodimacLpnUpdateModel();


  // MODAL: Progreso
  isDisplay: boolean = false;
  isDisplayVisor: boolean = false;
  isDisplayGenerandoVisor: boolean = false;

  isDataBlob: Blob;


  // DETALLE
  columnas: any[];
  detail: IOrdenVentaSodimacDetalle[] = [];
  selected: IOrdenVentaSodimacDetalle[] = [];


  constructor
  (
    private router: Router,
    public app: LayoutComponent,
    private readonly route: ActivatedRoute,
    public readonly utilService: UtilService,
    private readonly swaCustomService: SwaCustomService,
    private ordenVentaSodimacService: OrdenVentaSodimacService,
  ) {}

  ngOnInit() {
    this.onBuildColumn();

    this.route.params.subscribe((params: Params) => {
      this.idOrdenVentaSodimac = Number(params["id"]);
      setTimeout(() => {
        this.getById(this.idOrdenVentaSodimac);
      }, 10);
    });
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'line',                header: '#' },
      { field: 'itemCode',            header: 'Código' },
      { field: 'sku',                 header: 'Sku' },
      { field: 'dscription',          header: 'Descripción' },
      { field: 'dscriptionLarga',     header: 'Descripción larga' },
      { field: 'ean',                 header: 'EAN' },
      { field: 'quantity',            header: 'Cantidad' }
    ];
  }

  getById(id: number) {
    this.isDisplay = true;
    this.ordenVentaSodimacService.getListOrdenVentaSodimacDetalleById(id)
    .subscribe({next:(data: IOrdenVentaSodimacDetalle[]) =>{
        this.isDisplay = false;
        this.detail = data;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  headerPrint() {
    const ean: string = this.selected.map(x=> x.ean).join(",");
    this.isDisplayGenerandoVisor = true;
    this.ordenVentaSodimacService.getListBarcodeEanPdfByEan(ean)
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

  onToRowSelectPrint(modelo: IOrdenVentaSodimacDetalle) {
    this.isDisplayGenerandoVisor = true;
    this.ordenVentaSodimacService.getListBarcodeEanPdfByEan(modelo.ean)
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

  back() {
    this.router.navigate(['/main/modulo-ven/panel-sodimac-pallet-list']);
  }
}
