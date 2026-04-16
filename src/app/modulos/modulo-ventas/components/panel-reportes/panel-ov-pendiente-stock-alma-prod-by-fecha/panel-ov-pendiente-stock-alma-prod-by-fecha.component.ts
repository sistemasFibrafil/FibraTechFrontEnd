import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IOrdersPendiente } from '../../../interfaces/sap-business-one/orders.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { OrdersService } from '../../../services/sap-business-one/orders.service';



@Component({
  selector: 'app-ven-panel-ov-pendiente-stock-alma-prod-by-fecha',
  templateUrl: './panel-ov-pendiente-stock-alma-prod-by-fecha.component.html',
  styleUrls: ['./panel-ov-pendiente-stock-alma-prod-by-fecha.component.css']
})
export class PanelOrdenVentaPendienteStockAlmaProdByFechaComponent implements OnInit {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'OV - Pendientes - Stock de Almacenes de Producción';
  subtitulo = 'OV - Pendientes - Stock de Almacenes de Producción';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;

  reporteList: IOrdersPendiente[];
  params: FilterRequestModel = new FilterRequestModel();

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Órdenes de venta - Pendientes - Stock de Almacenes de Producción - ' + this.fecha;

  constructor
  (
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private ordersService: OrdersService,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
  ) {}

  ngOnInit() {

    this.modeloForm = this.fb.group(
      {
        'dat1'    : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'dat2'    : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
        'text1'   : new FormControl(''),
      }
    );

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-ov-pendiente-stock-alma-prod-by-fecha');
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
    this.onSetParametro();
    this.ordersService.getListOrdenVentaPendienteStockAlmacenProduccionByFecha(this.params)
    .subscribe({ next: (resp: IOrdersPendiente[])=>{
        this.isDisplay = false;
        this.reporteList = resp;
      },
      error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ordersService.getOrdenVentaPendienteStockAlmacenProduccionExcelByFecha(this.params)
    .subscribe({next:(response: any) => {
        saveAs(
          new Blob([response],
          {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          this.nombreArchivo
        );
        this.isDisplay = false;
        this.swaCustomService.swaMsgExito(null);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }
}
