import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IOrdenVentaPendienteByFecha } from '../../../interfaces/sap/orden-venta.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { OrdenVentaService } from '../../../services/sap/orden-venta.service';



@Component({
  selector: 'app-ven-panel-ov-programacion-by-fecha',
  templateUrl: './panel-ov-programacion-by-fecha.component.html',
  styleUrls: ['./panel-ov-programacion-by-fecha.component.css']
})
export class PanelOrdenVentaProgramcionByFechaComponent implements OnInit {
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'Órdenes de Venta - Programación';
  subtitulo = 'Órdenes de Venta - Programación';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;

  reporteList: IOrdenVentaPendienteByFecha[];
  params: FilterRequestModel = new FilterRequestModel();

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Órdenes de Venta - Programación - ' + this.fecha;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private OrdenVentaService: OrdenVentaService
  ){}

  ngOnInit() {
    this.modeloForm = this.fb.group(
    {
      'dat1'      : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'dat2'      : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'text1'     : new FormControl(''),
    });

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-ov-programacion-by-fecha');
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
    this.OrdenVentaService.getListOrdenVentaProgramacionByFecha(this.params)
    .subscribe({next:(data: IOrdenVentaPendienteByFecha[]) =>{
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

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.OrdenVentaService.getOrdenVentaProgramacionExcelByFecha(this.params)
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
