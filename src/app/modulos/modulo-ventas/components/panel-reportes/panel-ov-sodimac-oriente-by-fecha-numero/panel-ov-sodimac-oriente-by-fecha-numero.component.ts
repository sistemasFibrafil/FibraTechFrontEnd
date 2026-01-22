import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IOrdenVentaSodimacConsulta } from '../../../interfaces/web/orden-venta-sodimac.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { OrdenVentaSodimacService } from '../../../services/web/orden-venta-sodimac.service';



@Component({
  selector: 'app-ven-panel-ov-sodimac-oriente-by-fecha-numero',
  templateUrl: './panel-ov-sodimac-oriente-by-fecha-numero.component.html',
  styleUrls: ['./panel-ov-sodimac-oriente-by-fecha-numero.component.css']
})
export class PanelOrdenVentaSodimacOrienteByFechaNumeroComponent implements OnInit {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'Despacho de Sodimac Oriente';
  subtitulo = 'Despacho de Sodimac Oriente';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;
  isDisplayVisor: boolean = false;
  isDisplayGenerandoVisor: boolean = false;

  isDataBlob: Blob;

  columnas: any[];

  reporteList: IOrdenVentaSodimacConsulta[];
  params: FilterRequestModel = new FilterRequestModel();

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Reporte - Despacho de Sodimac Oriente -';


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private ordenVentaSodimacService: OrdenVentaSodimacService
  ) {}

  ngOnInit() {
    this.modeloForm = this.fb.group(
    {
      'dat1'      : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'dat2'      : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'text1'     : new FormControl(''),
    });

    this.columnas = [
      { field: 'numOrdenCompra',    header: 'Número OC' },
      { field: 'taxDate',           header: 'Fecha esperada' },
      { field: 'docDueDate',        header: 'Fecha vencimiento' },
      { field: 'ean',               header: 'EAN' },
      { field: 'sku',               header: 'Sku' },
      { field: 'dscriptionLarga',   header: 'Descripción' },
      { field: 'nomLocal',          header: 'Local' },
      { field: 'quantity',          header: 'Cantidad' }
    ];

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-ov-sodimac-oriente-by-fecha-numero');
  }

  onToBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
  }

  onListar() {
    this.isDisplay = true;
    this.reporteList = [];
    this.onSetParametro();
    this.ordenVentaSodimacService.getListOrdenVentaSodimacSelvaFechaNumero(this.params)
    .subscribe({next:(data: IOrdenVentaSodimacConsulta[]) =>{
      if(data)
      {
        this.isDisplay = false;
        this.reporteList = data;
      }
      this.isDisplay = false;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToImprimir() {
    this.isDisplayGenerandoVisor = true;
    this.onSetParametro();
    this.ordenVentaSodimacService.getListOrdenVentaSodimacSelvaPdfByFechaNumero(this.params)
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
